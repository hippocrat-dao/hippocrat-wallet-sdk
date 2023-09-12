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
(0, mocha_1.describe)('HPO payment test', () => {
    (0, mocha_1.it)('HPO payment is to transfer HPO token', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential = await hippocrat.BtcWallet.getAccountFromMnemonic(mnemonic, 0);
        const btcAddressPotential = await hippocrat.BtcWallet.getAddressFromAccount(btcAccountPotential, 0);
        // When
        const tx = await hippocrat.HpoPayment.transferHpo(btcAddressPotential.privateKey?.toString('hex'), 1, '0x40CB4DA705a044016e66dB2E30AdE93EbFe4abD4');
        // then (this will fail as signer does not have either HPO or ethereum)
        assert.strictEqual(tx.to, '0x40CB4DA705a044016e66dB2E30AdE93EbFe4abD4');
    });
});
(0, mocha_1.describe)('HPO address test', () => {
    (0, mocha_1.it)('HPO address is ethereum address format', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential = await hippocrat.BtcWallet.getAccountFromMnemonic(mnemonic, 0);
        const btcAddressPotential = await hippocrat.BtcWallet.getAddressFromAccount(btcAccountPotential, 0);
        // When
        const hpoAddress = await hippocrat.HpoPayment.generateHpoAddress(btcAddressPotential.privateKey?.toString('hex'));
        console.log(hpoAddress);
        // then (this will fail as signer does not have either HPO or ethereum)
        assert.strictEqual(hpoAddress.slice(0, 2), '0x');
        assert.strictEqual(hpoAddress.length, 42);
    });
});
