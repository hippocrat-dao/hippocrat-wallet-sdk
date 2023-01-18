import * as bitcoin from 'bitcoinjs-lib';
import * as ecPair from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import * as wif from 'wif';
import BtcRpcNode from './BtcRpcNode.js';
import coinSelect from 'coinselect';
import * as liquid from 'liquidjs-lib';
import BtcSigner from './models/BtcSigner.js';
import BtcReceiver from './models/BtcReceiver.js';
import UTXO from './models/UTXO.js';
import BtcNetwork from './enums/BtcNetwork.js';
import BtcRpcUrl from './enums/BtcRpcUrl.js';
import BtcAccount from './models/BtcAccount.js';
import TxFee from './enums/TxFee.js';
import BtcWallet from './BtcWallet.js';

class BtcPayment {
    // Account to pay transaction
    static getBtcSigner = async (
      mnemonic : string, btcNetwork : BtcNetwork = BtcNetwork.Mainnet, 
      accountIndex = 0, addressIndex = 0, addressReuse = true)
    : Promise<BtcSigner> => {
        const btcAccount : BtcAccount = await BtcWallet.getAccountFromMnemonic(
          mnemonic, accountIndex);
        const btcAddressSigner : BtcAccount = await BtcWallet.getAddressFromAccount(
          btcAccount, addressIndex);
        /* wif stands for Wallet Import Format, 
           need to encode private key to import wallet */
        const wifEncodedKey : string = wif.encode(
            128 as number, btcAddressSigner.privateKey as Buffer, true as boolean
        );
        const keyPair : ecPair.ECPairInterface = ecPair.ECPairFactory(ecc)
        .fromWIF(
            wifEncodedKey
        );
        // change prefix for liquid
        if(btcNetwork === 'liquid' || 
        btcNetwork === 'liquid testnet') {
          keyPair.network.messagePrefix = "\x18Liquid Signed Message:\n";
          btcNetwork === 'liquid'?  
          keyPair.network.bech32 = "ex"
          : keyPair.network.bech32 = "tex";
        }
        // latest version: SegWit
        const payment : bitcoin.payments.Payment = bitcoin.payments.p2wpkh({ 
            pubkey: keyPair.publicKey as Buffer,
            network: 
                btcNetwork === "mainnet" ? 
                bitcoin.networks.bitcoin
                : btcNetwork === "testnet" ? 
                bitcoin.networks.testnet
                : btcNetwork === "liquid" ?
                liquid.networks.liquid
                : liquid.networks.testnet as bitcoin.networks.Network
            });
        // change address to prevent address reuse if you can
        const addressNext : string = addressReuse ? payment.address as string 
        : await BtcWallet.generateBtcAddress(
            await BtcWallet.getAddressFromAccount(btcAccount, addressIndex + 1),
          btcNetwork);
        
        return {
            payment,
            keyPair,
            addressNext
        };
    }
    static writeOnBtc = async (
      signer : BtcSigner, messageList : string[], txFee = TxFee.Average) 
    : Promise<string> => {
        // signerUTXO to spend
        const btcRpcUrl : BtcRpcUrl = await this._getSignerNetwork(signer);
        const signerUTXOList : UTXO[] = await BtcRpcNode.getUTXOList(
          signer.payment.address as string, btcRpcUrl);
        // need to calculate OP_RETURN(message) bytes to include fee for optimizer in advance
        const messageListBytes : number = (new Blob(messageList).size) + (messageList.length * 10);
        // singleTxBytes * txFeeRecal = (singleTxBytes + msgBytes) * txFee
        const txFeeRecalculated = Math.ceil(((192/*single tx size*/ + messageListBytes)*txFee)/192);
        // get optimized transaction  
        const psbt : bitcoin.Psbt = await this._utxoOptimizer(
          signer, [], signerUTXOList, txFeeRecalculated);
        // data to store for did
        messageList.forEach((message) => {
          const data : Buffer = Buffer.from(message, 'utf8');
          const embed : bitcoin.payments.Payment = bitcoin.payments.embed(
            { data: [data] as Buffer[] });
          // add OP_RETURN(hippocrat did registry)
          psbt.addOutput({
            script: embed.output as Buffer,
            value: 0 as number
          } as bitcoin.PsbtTxOutput)
        });
        // sign and broadcast tx
        return await this._signAndBroadcastTx(signer, psbt);
    }
    // segWitTransfer support 
    static transferBtc = async (
      signer : BtcSigner, receiverList : BtcReceiver[], txFee = TxFee.Average) 
    : Promise<string> => {
        // signerUTXO to spend
        const btcRpcUrl : BtcRpcUrl = await this._getSignerNetwork(signer);
        const signerUTXOList : UTXO[] = await BtcRpcNode.getUTXOList(
          signer.payment.address as string, btcRpcUrl);
        // get optimized transaction  
        const psbt : bitcoin.Psbt = await this._utxoOptimizer(
          signer, receiverList, signerUTXOList, txFee);
        // sign and broadcast tx
        return await this._signAndBroadcastTx(signer, psbt);
    }
    // helper method to select UTXO and fee
    private static _utxoOptimizer = async(
      signer : BtcSigner, target : BtcReceiver[], 
      signerUTXOList : UTXO[], txFee : TxFee)
    : Promise<bitcoin.Psbt> => {
        const feeRate : number = txFee;
        const selectedUTXO : any = coinSelect(signerUTXOList, target, feeRate);
        // .inputs and .outputs will be undefined if no solution was found
        if (!selectedUTXO.inputs || !selectedUTXO.outputs) return Promise.reject(
          new Error('No UTXO found for valid transaction. Please check whether UTXOs are enough!'));
        // creation of psbt
        const psbt : bitcoin.Psbt = new bitcoin.Psbt({ 
          network: signer.payment.network as bitcoin.networks.Network });
        // add optimized input & ouput UTXO
        selectedUTXO.inputs.forEach((input : any) =>
          psbt.addInput({
            hash: input.txid as string | Buffer, // tx id
            index: input.vout as number, // output number of above tx hash
            witnessUtxo: {
              script: signer.payment.output as Buffer, // scriptPubKey
              value: input.value as number, // UTXO amount
            }
          } as bitcoin.PsbtTxInput)
        )
        selectedUTXO.outputs.forEach((output : any) => {
          // watch out, outputs may have been added that you need to provide
          // an output address/script for
          if (!output.address as boolean) {
            output.address = signer.addressNext as string;
          }
          psbt.addOutput({
            address: output.address as string,
            value: output.value as number,
          } as bitcoin.PsbtTxOutput)
        })        
        return psbt;
    }
    // helper method to sign and broadcast tx
    private static _signAndBroadcastTx = async(
      signer : BtcSigner,
      psbt : bitcoin.Psbt)
    : Promise<string> => {
      psbt.signAllInputs(
        signer.keyPair as ecPair.ECPairInterface
      );

      psbt.finalizeAllInputs() as bitcoin.Psbt;

      const tx : bitcoin.Transaction = psbt.extractTransaction();

      const btcRpcUrl : BtcRpcUrl = await this._getSignerNetwork(signer);

      return await BtcRpcNode.broadcastTx(
        tx.toHex() as string, btcRpcUrl
        ) as string;
    }
    // helper method to get network of signer
    private static _getSignerNetwork = async(
      signer: BtcSigner)
    : Promise<BtcRpcUrl> => {
      return signer.payment.network === bitcoin.networks.bitcoin ?
      BtcRpcUrl.Mainnet 
      : signer.payment.network === bitcoin.networks.testnet ? 
      BtcRpcUrl.Testnet 
      : signer.payment.network === liquid.networks.liquid ? 
      BtcRpcUrl.Liquid
      : BtcRpcUrl.Liquid_Testnet
    }
}

export default BtcPayment;