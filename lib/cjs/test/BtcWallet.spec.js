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
(0, mocha_1.describe)('Mnemonic generator test', () => {
    (0, mocha_1.it)('should return 12 words mnemonic', async () => {
        // When
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const mnemonicArr = mnemonic.split(" ");
        // Then
        assert.strictEqual(mnemonicArr.length, 12);
    });
});
(0, mocha_1.describe)('BtcAccount(BIP32, BIP44) generator test', () => {
    (0, mocha_1.it)('should return btcAccount(bip32, bip44) with 32 bytes hex private key', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        // When
        const btcAccountPotential = await hippocrat.BtcWallet.getAccountFromMnemonic(mnemonic, 0);
        const privateKey = btcAccountPotential.privateKey.toString('hex');
        // Then
        assert.strictEqual(privateKey.length, 64);
    });
});
(0, mocha_1.describe)('BtcAddress(BIP3, BIP44) generator test', () => {
    (0, mocha_1.it)('should return btcAccount(bip32, bip44) with 32 bytes hex private key', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential = await hippocrat.BtcWallet.getAccountFromMnemonic(mnemonic, 0);
        // When
        const btcAddressPotential = await hippocrat.BtcWallet.getAddressFromAccount(btcAccountPotential, 0);
        const privateKey = btcAddressPotential.privateKey.toString('hex');
        // Then
        assert.strictEqual(privateKey.length, 64);
    });
});
(0, mocha_1.describe)('Btc compressed address generator test', () => {
    (0, mocha_1.it)('should return segwit address with 21 bytes hex with prefix "bc1"', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential = await hippocrat.BtcWallet.getAccountFromMnemonic(mnemonic, 0);
        const btcAddressPotential = await hippocrat.BtcWallet.getAddressFromAccount(btcAccountPotential, 0);
        const btcNetwork = hippocrat.BtcNetwork.Mainnet;
        // When
        const btcAddress = await hippocrat.BtcWallet.generateBtcAddress(btcAddressPotential, btcNetwork);
        // Then
        assert.strictEqual(btcAddress.length, 42);
        assert.strictEqual(btcAddress.slice(0, 3), "bc1");
    });
});
(0, mocha_1.describe)('Mnemonic encrypt/decrypt test', () => {
    (0, mocha_1.it)('mnemonic should be same after encryptioin-decryption process', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        // When
        const encryptedVault = await hippocrat.BtcWallet.generateEncryptedVault(mnemonic, "password");
        const decryptedVault = await hippocrat.BtcWallet.decryptVault(encryptedVault, "password");
        // Then
        assert.strictEqual(mnemonic, decryptedVault);
    });
});
