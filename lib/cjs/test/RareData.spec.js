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
(0, mocha_1.describe)('ECIES data encrypt/decrypt test', () => {
    (0, mocha_1.it)('data should be same after encrypt-decrypt process', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const publicKeyTo = btcAccountPotential.publicKey.toString('hex');
        const privateKey = btcAccountPotential.privateKey.toString('hex');
        const data = "rare data";
        // When
        const encryptedData = await hippocrat.RareData.encryptData(publicKeyTo, data);
        const decryptedData = await hippocrat.RareData.decryptData(privateKey, encryptedData);
        // Then
        assert.strictEqual(data, decryptedData);
    });
});
(0, mocha_1.describe)('ECDH+AES(with fixed key) data encrypt/decrypt test', () => {
    (0, mocha_1.it)('shared data should be same after encrypt-decrypt process', async () => {
        // Given
        const mnemonic_A = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential_A = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic_A);
        const publicKey_A = btcAccountPotential_A.publicKey.toString('hex');
        const privateKey_A = btcAccountPotential_A.privateKey.toString('hex');
        const mnemonic_B = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential_B = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic_B);
        const publicKey_B = btcAccountPotential_B.publicKey.toString('hex');
        const privateKey_B = btcAccountPotential_B.privateKey.toString('hex');
        const sharedData = "shared rare data";
        // When
        const encryptedSharedDataFromA = await hippocrat.RareData.encryptDataShared(privateKey_A, publicKey_B, sharedData);
        const decryptedSharedDataByA = await hippocrat.RareData.decryptDataShared(privateKey_A, publicKey_B, encryptedSharedDataFromA);
        const decryptedSharedDataByB = await hippocrat.RareData.decryptDataShared(privateKey_B, publicKey_A, encryptedSharedDataFromA);
        // Then
        assert.strictEqual(decryptedSharedDataByA, sharedData);
        assert.strictEqual(decryptedSharedDataByA, decryptedSharedDataByB);
    });
});
