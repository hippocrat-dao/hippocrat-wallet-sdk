import * as bitcoin from 'bitcoinjs-lib';
import * as ecPair from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import * as wif from 'wif';
import BtcRpcNode from './BtcRpcNode.js';
import coinSelect from 'coinselect';
import * as liquid from 'liquidjs-lib';
import BtcRpcUrl from './enums/BtcRpcUrl.js';
class BtcPayment {
    // Account to pay transaction
    static getBtcSigner = async (btcAccountSigner, btcNetwork) => {
        /* wif stands for Wallet Import Format,
           need to encode private key to import wallet */
        const wifEncodedKey = wif.encode(128, btcAccountSigner.privateKey, true);
        const keyPair = ecPair.ECPairFactory(ecc)
            .fromWIF(wifEncodedKey);
        // change prefix for liquid
        if (btcNetwork === 'liquid' ||
            btcNetwork === 'liquid testnet') {
            keyPair.network.messagePrefix = "\x18Liquid Signed Message:\n";
            btcNetwork === 'liquid' ?
                keyPair.network.bech32 = "ex"
                : keyPair.network.bech32 = "tex";
        }
        // latest version: SegWit
        const payment = bitcoin.payments.p2wpkh({
            pubkey: keyPair.publicKey,
            network: btcNetwork === "mainnet" ?
                bitcoin.networks.bitcoin
                : btcNetwork === "testnet" ?
                    bitcoin.networks.testnet
                    : btcNetwork === "liquid" ?
                        liquid.networks.liquid
                        : liquid.networks.testnet
        });
        return {
            payment,
            keyPair
        };
    };
    static registerDid = async (signer, toAddressList, didmsg, txFee) => {
        // signerUTXO to spend
        const btcRpcUrl = await this._getSignerNetwork(signer);
        const signerUTXOList = await BtcRpcNode.getUTXOList(signer.payment.address, btcRpcUrl);
        // didOwnerList
        let receiverList = [];
        toAddressList.forEach(toAddress => {
            receiverList.push({ address: toAddress, value: 1 });
        });
        // get optimized transaction  
        const psbt = await this._utxoOptimizer(signer, receiverList, signerUTXOList, txFee);
        // data to store for did
        const data = Buffer.from(didmsg, 'utf8');
        const embed = bitcoin.payments.embed({ data: [data] });
        // add OP_RETURN(hippocrat did registry)
        psbt.addOutput({
            script: embed.output,
            value: 0
        });
        // sign and broadcast tx
        return await this._signAndBroadcastTx(signer, psbt);
    };
    // segWitTransfer support 
    static segWitTransfer = async (signer, receiverList, txFee) => {
        // signerUTXO to spend
        const btcRpcUrl = await this._getSignerNetwork(signer);
        const signerUTXOList = await BtcRpcNode.getUTXOList(signer.payment.address, btcRpcUrl);
        // get optimized transaction  
        const psbt = await this._utxoOptimizer(signer, receiverList, signerUTXOList, txFee);
        // sign and broadcast tx
        return await this._signAndBroadcastTx(signer, psbt);
    };
    // helper method to select UTXO and fee
    static _utxoOptimizer = async (signer, target, signerUTXOList, txFee) => {
        const feeRate = txFee;
        const selectedUTXO = coinSelect(signerUTXOList, target, feeRate);
        // .inputs and .outputs will be undefined if no solution was found
        if (!selectedUTXO.inputs || !selectedUTXO.outputs)
            return Promise.reject(new Error('No UTXO found for valid transaction'));
        // creation of psbt
        const psbt = new bitcoin.Psbt({
            network: signer.payment.network
        });
        // add optimized input & ouput UTXO
        selectedUTXO.inputs.forEach((input) => psbt.addInput({
            hash: input.txid,
            index: input.vout,
            witnessUtxo: {
                script: signer.payment.output,
                value: input.value, // UTXO amount
            }
        }));
        selectedUTXO.outputs.forEach((output) => {
            // watch out, outputs may have been added that you need to provide
            // an output address/script for
            if (!output.address) {
                output.address = signer.payment.address;
            }
            psbt.addOutput({
                address: output.address,
                value: output.value,
            });
        });
        return psbt;
    };
    // helper method to sign and broadcast tx
    static _signAndBroadcastTx = async (signer, psbt) => {
        psbt.signAllInputs(signer.keyPair);
        psbt.finalizeAllInputs();
        const tx = psbt.extractTransaction();
        const btcRpcUrl = await this._getSignerNetwork(signer);
        return await BtcRpcNode.broadcastTx(tx.toHex(), btcRpcUrl);
    };
    // helper method to get network of signer
    static _getSignerNetwork = async (signer) => {
        return signer.payment.network === bitcoin.networks.bitcoin ?
            BtcRpcUrl.Mainnet
            : signer.payment.network === bitcoin.networks.testnet ?
                BtcRpcUrl.Testnet
                : signer.payment.network === liquid.networks.liquid ?
                    BtcRpcUrl.Liquid
                    : BtcRpcUrl.Liquid_Testnet;
    };
}
export default BtcPayment;
