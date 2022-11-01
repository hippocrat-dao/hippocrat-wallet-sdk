import * as bitcoin from 'bitcoinjs-lib';
import * as ecPair from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import * as wif from 'wif';
import BtcRpcNode from './BtcRpcNode.js';
import coinSelect from 'coinselect';

class BtcPayment {
    // Account to pay transaction
    static getBtcSigner = async (privateKey : Buffer)
    : Promise<{
      payment: bitcoin.payments.Payment,
      keyPair: ecPair.ECPairInterface
    }> => {
        /* wif stands for Wallet Import Format, 
           need to encode private key to import wallet */
        const wifEncodedKey : string = wif.encode(128 as number, 
            privateKey, true as boolean
        );
        const keyPair : ecPair.ECPairInterface = ecPair.ECPairFactory(ecc)
        .fromWIF(
            wifEncodedKey
        );
        // latest version: SegWit
        const payment : bitcoin.payments.Payment = bitcoin.payments.p2wpkh({ 
            pubkey: keyPair.publicKey as Buffer,
            network: bitcoin.networks.testnet as bitcoin.networks.Network });
        return {
            payment,
            keyPair
        };
    }
    static createDid = async (signer : {
      payment: bitcoin.payments.Payment,
      keyPair: ecPair.ECPairInterface
    }, toAddress : string, didmsg : string) 
    : Promise<string> => {
        // signerUTXO to spend
        const signerUTXOList : any = await BtcRpcNode.getUTXOList(
          signer.payment.address as string);
        // didOwnerList
        const target : [{address: string, value: number}] = [{address: toAddress, value: 1}];
        const psbtInput : bitcoin.Psbt = new bitcoin.Psbt({ 
          network: bitcoin.networks.testnet as bitcoin.networks.Network })
        // get optimized transaction  
        const psbt : bitcoin.Psbt = await this._utxoOptimizer(
          signer, target, signerUTXOList, psbtInput);
        // data to store for did
        const data : Buffer = Buffer.from(didmsg, 'utf8');
        const embed : bitcoin.payments.Payment = bitcoin.payments.embed(
          { data: [data] as Buffer[] });
        // add OP_RETURN(hipocrat did registry)
        psbt.addOutput({
          script: embed.output as Buffer,
          value: 0 as number
        } as bitcoin.PsbtTxOutput)
        // sign and broadcast tx
        return await this._signAndBroadcastTx(signer, psbt);
    }
    // segWitTransfer support 
    static segWitTransfer = async (signer : {
      payment: bitcoin.payments.Payment,
      keyPair: ecPair.ECPairInterface
    }, toAddress : string, transferAmount : number) 
    : Promise<string> => {
        // signerUTXO to spend
        const signerUTXO : any = await BtcRpcNode.getUTXOLatest(
          signer.payment.address as string);
        const inputUTXO : any = {
            hash: signerUTXO.txid as string, // txId
            index: signerUTXO.vout as number, // output number of above tx hash
            witnessUtxo: {
              script: signer.payment.output as Buffer, // scriptPubKey
              value: signerUTXO.value as number, // UTXO amount
            },
        };
        const minerFee : number = 1000;
        const signerAmount : number = inputUTXO.witnessUtxo.value - (minerFee+transferAmount);
        
        const psbt : bitcoin.Psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet })
          .addInput(inputUTXO as bitcoin.PsbtTxInput)
          // signerUTXO
          .addOutput({
            address: signer.payment.address as string,
            value: signerAmount as number,
          } as bitcoin.PsbtTxOutput)
          // receiverUTXO
          .addOutput({
            address: toAddress as string,
            value: transferAmount as number,
          } as bitcoin.PsbtTxOutput)
          .signInput(
            0 as number,
            signer.keyPair as ecPair.ECPairInterface);

        psbt.finalizeAllInputs() as bitcoin.Psbt;

        const tx : bitcoin.Transaction = psbt.extractTransaction();

        return await BtcRpcNode.broadcastTx(tx.toHex() as string) as string;
    }
    // helper method to select UTXO and fee
    private static _utxoOptimizer = async(
      signer : {
        payment: bitcoin.payments.Payment,
        keyPair: ecPair.ECPairInterface
      }, 
      target : [{
        address: string,
        value: number
      }], signerUTXOList : any, psbt : bitcoin.Psbt)
    : Promise<bitcoin.Psbt> => {
        const feeRate : number = 55; // satoshis per byte
        const selectedUTXO : any = coinSelect(signerUTXOList, target, feeRate);
        // .inputs and .outputs will be undefined if no solution was found
        if (!selectedUTXO.inputs || !selectedUTXO.outputs) return Promise.reject(
          new Error('No UTXO found for valid transaction'));
        // add optimized input & ouput UTXO
        selectedUTXO.inputs.forEach((input : any) =>
          psbt.addInput({
            hash: input.txid as string | Buffer,
            index: input.vout as number,
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
            output.address = signer.payment.address as string;
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
      signer : {
        payment: bitcoin.payments.Payment,
        keyPair: ecPair.ECPairInterface
      },
      psbt : bitcoin.Psbt)
    : Promise<string> => {
      psbt.signInput(
        0 as number,
        signer.keyPair as ecPair.ECPairInterface
      );

      psbt.finalizeAllInputs() as bitcoin.Psbt;

      const tx : bitcoin.Transaction = psbt.extractTransaction();

      return await BtcRpcNode.broadcastTx(tx.toHex() as string) as string;
    }
}

export default BtcPayment;