import * as bitcoin from 'bitcoinjs-lib';
import * as ecPair from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import * as wif from 'wif';
import BtcRpcNode from './BtcRpcNode.js';

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
        const transferAmount : number = 1000;
        const signerAmount : number = inputUTXO.witnessUtxo.value - (minerFee+transferAmount);
        // data to store
        const data : Buffer = Buffer.from(didmsg, 'utf8');
        const embed : bitcoin.payments.Payment = bitcoin.payments.embed(
          { data: [data] as Buffer[] });
        const psbt : bitcoin.Psbt = new bitcoin.Psbt({ 
          network: bitcoin.networks.testnet as bitcoin.networks.Network })
          .addInput(inputUTXO as bitcoin.PsbtTxInput)
          // signerUTXO
          .addOutput({
            address: signer.payment.address as string,
            value: signerAmount as number,
          } as bitcoin.PsbtTxOutput)
          // OP_RETURN(humanDid)
          .addOutput({
            script: embed.output as Buffer,
            value: 0 as number
          } as bitcoin.PsbtTxOutput)
          // receiverUTXO(owner of OP_RETURN)
          .addOutput({
            address: toAddress as string,
            value: transferAmount as number,
          } as bitcoin.PsbtTxOutput)
          .signInput(
            0 as number,
            signer.keyPair as ecPair.ECPairInterface
            );

        psbt.finalizeAllInputs() as bitcoin.Psbt;

        const tx : bitcoin.Transaction = psbt.extractTransaction();

        return await BtcRpcNode.broadcastTx(tx.toHex() as string) as string;
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

}

export default BtcPayment;