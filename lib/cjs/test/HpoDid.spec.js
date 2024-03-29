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
(0, mocha_1.describe)('HPO DID create test', () => {
    (0, mocha_1.it)('HPO DID document should meet the spec', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential = await hippocrat.BtcWallet.getAccountFromMnemonic(mnemonic, 0);
        const btcAddressPotential = await hippocrat.BtcWallet.getAddressFromAccount(btcAccountPotential, 0);
        const hpoDidPotential = await hippocrat.BtcWallet.getChildFromAddress(btcAddressPotential, 0);
        const hpoDid = await hippocrat.HpoDid.create(hpoDidPotential.privateKey?.toString('hex'));
        // When
        const pubKeyHex = hpoDidPotential.publicKey.toString('hex');
        // Then
        assert.strictEqual(hpoDid.id.slice(0, 8), 'did:hpo:');
        assert.strictEqual(hpoDid.id.slice(8), pubKeyHex);
    });
});
(0, mocha_1.describe)('HPO DID sign and verify test', () => {
    (0, mocha_1.it)('HPO DID is signable', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential = await hippocrat.BtcWallet.getAccountFromMnemonic(mnemonic, 0);
        const btcAddressPotential = await hippocrat.BtcWallet.getAddressFromAccount(btcAccountPotential, 0);
        const hpoDidPotential = await hippocrat.BtcWallet.getChildFromAddress(btcAddressPotential, 0);
        const hpoDid = await hippocrat.HpoDid.create(hpoDidPotential.privateKey?.toString('hex'));
        const publicKey = hpoDid.id.slice(8);
        // When
        const signature = await hippocrat.HpoDid.sign(hpoDidPotential.privateKey?.toString('hex'));
        const isValidSignature = await hippocrat.HpoDid.verify(publicKey, signature);
        // Then
        assert.strictEqual(isValidSignature, true);
    });
});
