"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bitcoin = __importStar(require("bitcoinjs-lib"));
const ecPair = __importStar(require("ecpair"));
const ecc = __importStar(require("tiny-secp256k1"));
const wif = __importStar(require("wif"));
const BtcRpcNode_js_1 = __importDefault(require("./BtcRpcNode.js"));
const coinselect_1 = __importDefault(require("coinselect"));
const liquid = __importStar(require("liquidjs-lib"));
const BtcRpcUrl_js_1 = __importDefault(require("./enums/BtcRpcUrl.js"));
const BtcWallet_js_1 = __importDefault(require("./BtcWallet.js"));
class BtcPayment {
    // Account to pay transaction
    static getBtcSigner = async (mnemonic, btcNetwork, accountIndex = 0, addressIndex = 0, addressReuse = false) => {
        const btcAccount = await BtcWallet_js_1.default.getAccountFromMnemonic(mnemonic, accountIndex);
        const btcAddressSigner = await BtcWallet_js_1.default.getAddressFromAccount(btcAccount, addressIndex);
        /* wif stands for Wallet Import Format,
           need to encode private key to import wallet */
        const wifEncodedKey = wif.encode(128, btcAddressSigner.privateKey, true);
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
        // change address to prevent address reuse if you can
        const addressNext = addressReuse ? payment.address
            : await BtcWallet_js_1.default.generateBtcAddress(await BtcWallet_js_1.default.getAddressFromAccount(btcAccount, addressIndex + 1), btcNetwork);
        return {
            payment,
            keyPair,
            addressNext
        };
    };
    static writeOnBtc = async (signer, messageList, txFee) => {
        // signerUTXO to spend
        const btcRpcUrl = await this._getSignerNetwork(signer);
        const signerUTXOList = await BtcRpcNode_js_1.default.getUTXOList(signer.payment.address, btcRpcUrl);
        // need to calculate OP_RETURN(message) bytes to include fee for optimizer in advance
        const messageListBytes = (new Blob(messageList).size) + (messageList.length * 10);
        // singleTxBytes * txFeeRecal = (singleTxBytes + msgBytes) * txFee
        const txFeeRecalculated = Math.ceil(((192 /*single tx size*/ + messageListBytes) * txFee) / 192);
        // get optimized transaction  
        const psbt = await this._utxoOptimizer(signer, [], signerUTXOList, txFeeRecalculated);
        // data to store for did
        messageList.forEach((message) => {
            const data = Buffer.from(message, 'utf8');
            const embed = bitcoin.payments.embed({ data: [data] });
            // add OP_RETURN(hippocrat did registry)
            psbt.addOutput({
                script: embed.output,
                value: 0
            });
        });
        // sign and broadcast tx
        return await this._signAndBroadcastTx(signer, psbt);
    };
    // segWitTransfer support 
    static transferBtc = async (signer, receiverList, txFee) => {
        // signerUTXO to spend
        const btcRpcUrl = await this._getSignerNetwork(signer);
        const signerUTXOList = await BtcRpcNode_js_1.default.getUTXOList(signer.payment.address, btcRpcUrl);
        // get optimized transaction  
        const psbt = await this._utxoOptimizer(signer, receiverList, signerUTXOList, txFee);
        // sign and broadcast tx
        return await this._signAndBroadcastTx(signer, psbt);
    };
    // helper method to select UTXO and fee
    static _utxoOptimizer = async (signer, target, signerUTXOList, txFee) => {
        const feeRate = txFee;
        const selectedUTXO = (0, coinselect_1.default)(signerUTXOList, target, feeRate);
        // .inputs and .outputs will be undefined if no solution was found
        if (!selectedUTXO.inputs || !selectedUTXO.outputs)
            return Promise.reject(new Error('No UTXO found for valid transaction. Please check whether UTXOs are enough!'));
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
                output.address = signer.addressNext;
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
        return await BtcRpcNode_js_1.default.broadcastTx(tx.toHex(), btcRpcUrl);
    };
    // helper method to get network of signer
    static _getSignerNetwork = async (signer) => {
        return signer.payment.network === bitcoin.networks.bitcoin ?
            BtcRpcUrl_js_1.default.Mainnet
            : signer.payment.network === bitcoin.networks.testnet ?
                BtcRpcUrl_js_1.default.Testnet
                : signer.payment.network === liquid.networks.liquid ?
                    BtcRpcUrl_js_1.default.Liquid
                    : BtcRpcUrl_js_1.default.Liquid_Testnet;
    };
}
exports.default = BtcPayment;
