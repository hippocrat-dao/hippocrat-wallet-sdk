import * as bitcoin from 'bitcoinjs-lib';
import coinSelect from 'coinselect';
import BtcRpcNode from './BtcRpcNode.js';
import BtcNetwork from './enums/BtcNetwork.js';
import BtcRpcUrl from './enums/BtcRpcUrl.js';
import TxFee from './enums/TxFee.js';
import BtcWallet from './BtcWallet.js';
class BtcPayment {
    // Account to pay transaction
    static getBtcSigner = async (mnemonic, btcNetwork = BtcNetwork.Mainnet, accountIndex = 0, changeIndex = 0, addressIndex = 0, addressReuse = true) => {
        const btcAccount = await BtcWallet.getAccountFromMnemonic(mnemonic, accountIndex);
        const btcAddressSigner = await BtcWallet.getAddressFromAccount(btcAccount, changeIndex, addressIndex);
        // latest version: SegWit
        const payment = bitcoin.payments.p2wpkh({
            pubkey: btcAddressSigner.publicKey,
            network: btcNetwork === 'mainnet'
                ? bitcoin.networks.bitcoin
                : bitcoin.networks.testnet,
        });
        // change address to prevent address reuse if you can
        const addressNext = addressReuse
            ? payment.address
            : await BtcWallet.generateBtcAddress(await BtcWallet.getAddressFromAccount(btcAccount, changeIndex + 1, addressIndex), btcNetwork);
        return {
            payment,
            keyPair: btcAddressSigner,
            addressNext,
        };
    };
    static writeOnBtc = async (signer, messageList, txFee = TxFee.Average) => {
        // signerUTXO to spend
        const btcRpcUrl = await this._getSignerNetwork(signer);
        const signerUTXOList = await BtcRpcNode.getUTXOList(signer.payment.address, btcRpcUrl);
        /*
            need to calculate OP_RETURN(message) bytes to include fee
            + OP_RETURN(1) + scriptPubKeyLength(1) + nValue(8) for each output
        */
        const additionalFee = (new Blob(messageList).size + messageList.length * 10) * txFee;
        // get optimized transaction
        const psbt = await this._utxoOptimizer(signer, [], signerUTXOList, txFee, additionalFee);
        // data to store
        messageList.forEach(message => {
            const data = Buffer.from(message, 'utf8');
            const embed = bitcoin.payments.embed({
                data: [data],
            });
            // add OP_RETURN
            psbt.addOutput({
                script: embed.output,
                value: 0,
            });
        });
        // sign and broadcast tx
        return await this._signAndBroadcastTx(signer, psbt);
    };
    // segWitTransfer support
    static transferBtc = async (signer, receiverList, txFee = TxFee.Average) => {
        // signerUTXO to spend
        const btcRpcUrl = await this._getSignerNetwork(signer);
        const signerUTXOList = await BtcRpcNode.getUTXOList(signer.payment.address, btcRpcUrl);
        // get optimized transaction
        const psbt = await this._utxoOptimizer(signer, receiverList, signerUTXOList, txFee);
        // sign and broadcast tx
        return await this._signAndBroadcastTx(signer, psbt);
    };
    // helper method to select UTXO and fee
    static _utxoOptimizer = async (signer, target, signerUTXOList, txFee, additionalFee = 0) => {
        // witness utxo to calculate correct fee
        for (let i = 0; i < signerUTXOList.length; i++) {
            signerUTXOList[i].witnessUtxo = {
                script: signer.payment.output,
                value: signerUTXOList[i].value, // UTXO amount
            };
        }
        const feeRate = txFee;
        const selectedUTXO = coinSelect(signerUTXOList, target, feeRate);
        // .inputs and .outputs will be undefined if no solution was found
        if (!selectedUTXO.inputs || !selectedUTXO.outputs)
            return Promise.reject(new Error('No UTXO found for valid transaction. Please check whether UTXOs are enough!'));
        // creation of psbt
        const psbt = new bitcoin.Psbt({
            network: signer.payment.network,
        });
        // add optimized input & ouput UTXO
        selectedUTXO.inputs.forEach((input) => psbt.addInput({
            hash: input.txid,
            index: input.vout,
            witnessUtxo: {
                script: signer.payment.output,
                value: input.value, // UTXO amount
            },
        }));
        selectedUTXO.outputs.forEach((output, idx) => {
            // watch out, outputs may have been added that you need to provide
            // an output address/script for
            if (!output.address) {
                output.address = signer.addressNext;
            }
            idx === selectedUTXO.outputs.length - 1
                ? psbt.addOutput({
                    address: output.address,
                    value: output.value - additionalFee,
                })
                : psbt.addOutput({
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
        return (await BtcRpcNode.broadcastTx(tx.toHex(), btcRpcUrl));
    };
    // helper method to get network of signer
    static _getSignerNetwork = async (signer) => {
        return signer.payment.network === bitcoin.networks.bitcoin
            ? BtcRpcUrl.Mainnet
            : BtcRpcUrl.Testnet;
    };
}
export default BtcPayment;
