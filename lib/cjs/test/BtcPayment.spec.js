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
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const mocha_1 = require("mocha");
const hippocrat = __importStar(require("../index.js"));
(0, mocha_1.describe)('get Bitcoin Signer test', () => {
    (0, mocha_1.it)('check private key & network, crucial to function as btcSigner', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const btcNetwork = hippocrat.BtcNetwork.Mainnet;
        // When
        const btcSigner = await hippocrat.BtcPayment.getBtcSigner(btcAccountPotential, btcNetwork);
        // Then
        assert.strictEqual(btcSigner.keyPair.privateKey?.toString('hex'), btcAccountPotential.privateKey?.toString('hex'));
        assert.strictEqual(btcSigner.payment.network?.messagePrefix, "\x18Bitcoin Signed Message:\n");
    });
});
(0, mocha_1.describe)('bitcoin DID registry test', () => {
    (0, mocha_1.it)('Tx contains OP_RETURN + 1 satoshi transfer to target address', async () => {
        // Given
        const mnemonic = "영남 진리 실력 생산 여대생 권리 내일 얼핏 졸업 형제 행사 경비";
        const btcAccountPotential = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const btcNetwork = hippocrat.BtcNetwork.Testnet;
        const btcSigner = await hippocrat.BtcPayment.getBtcSigner(btcAccountPotential, btcNetwork);
        const toAddress = "tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c";
        const didmsg = "certified";
        const txFee = hippocrat.TxFee.Average;
        // When
        await hippocrat.BtcPayment.registerDid(btcSigner, [toAddress], didmsg, txFee);
        const didTxProcessing = await hippocrat.BtcRpcNode.getUTXOLatest(toAddress, hippocrat.BtcRpcUrl.Testnet);
        // Then
        assert.strictEqual(didTxProcessing.value, 1);
        assert.strictEqual(didTxProcessing.status.confirmed, false);
    });
});
(0, mocha_1.describe)('bitcoin transfer transaction test', () => {
    (0, mocha_1.it)('Tx contains target value & toAddress, could transfer to multiple address', async () => {
        // Given
        const mnemonic = "영남 진리 실력 생산 여대생 권리 내일 얼핏 졸업 형제 행사 경비";
        const btcAccountPotential = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const btcNetwork = hippocrat.BtcNetwork.Testnet;
        const btcSigner = await hippocrat.BtcPayment.getBtcSigner(btcAccountPotential, btcNetwork);
        const toAddress = "tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c";
        const transferAmount = 2;
        const txFee = hippocrat.TxFee.Average;
        // When
        await hippocrat.BtcPayment.segWitTransfer(btcSigner, [{
                address: toAddress,
                value: transferAmount
            }], txFee);
        const transferTxProcessing = await hippocrat.BtcRpcNode.getUTXOLatest(toAddress, hippocrat.BtcRpcUrl.Testnet);
        // Then
        assert.strictEqual(transferTxProcessing.value, 2);
        assert.strictEqual(transferTxProcessing.status.confirmed, false);
    });
});
