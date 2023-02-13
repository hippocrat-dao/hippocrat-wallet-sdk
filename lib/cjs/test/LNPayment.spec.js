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
(0, mocha_1.describe)('LNPayment create invoice test', () => {
    (0, mocha_1.it)('invoice pub key should be pub key of signer', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential = await hippocrat.BtcWallet.getAccountFromMnemonic(mnemonic);
        const btcAddressPotential = await hippocrat.BtcWallet.getAddressFromAccount(btcAccountPotential);
        const lightningIndex = 0; // 0 is default, let's use address child for LNPayment
        const LNSigner = await hippocrat.BtcWallet.getChildFromAddress(btcAddressPotential, lightningIndex);
        const btcAddressString = await hippocrat.BtcWallet.generateBtcAddress(LNSigner);
        // When
        const bolt11 = await hippocrat.LNPayment.createInvoice(LNSigner.privateKey.toString('hex'), 1, // satoshi to request
        "preimage", // preimage to reveal(must be 32 random bytes)
        btcAddressString, // fallback btc address
        "paymentSecret" // paymentSecret to reveal(must be 32 random bytes)
        );
        // Then
        assert.strictEqual(bolt11.payeeNodeKey, LNSigner.publicKey.toString('hex'));
    });
});
