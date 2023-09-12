import * as assert from 'assert';
import { describe, it } from 'mocha';
import * as hippocrat from '../index.js';
describe('Mnemonic generator test', () => {
    it('should return 12 words mnemonic', async () => {
        // When
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const isvalid = await hippocrat.BtcWallet.isMnemonicValid(mnemonic);
        // Then
        assert.strictEqual(isvalid, true);
    });
});
describe('BtcAccount(BIP32, BIP44) generator test', () => {
    it('should return btcAccount(bip32, bip44) with 32 bytes hex private key', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        // When
        const btcAccountPotential = await hippocrat.BtcWallet.getAccountFromMnemonic(mnemonic, 0);
        const privateKey = btcAccountPotential.privateKey.toString('hex');
        // Then
        assert.strictEqual(privateKey.length, 64);
    });
});
describe('BtcAddress(BIP3, BIP44) generator test', () => {
    it('should return btcAccount(bip32, bip44) with 32 bytes hex private key', async () => {
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
describe('Btc compressed address generator test', () => {
    it('should return segwit address with 21 bytes hex with prefix "bc1"', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential = await hippocrat.BtcWallet.getAccountFromMnemonic(mnemonic, 0);
        const btcAddressPotential = await hippocrat.BtcWallet.getAddressFromAccount(btcAccountPotential, 0);
        const btcNetwork = hippocrat.BtcNetwork.Mainnet;
        // When
        const btcAddress = await hippocrat.BtcWallet.generateBtcAddress(btcAddressPotential, btcNetwork);
        // Then
        assert.strictEqual(btcAddress.length, 42);
        assert.strictEqual(btcAddress.slice(0, 3), 'bc1');
    });
});
describe('Mnemonic encrypt/decrypt test', () => {
    it('mnemonic should be same after encryptioin-decryption process', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        // When
        const encryptedVault = await hippocrat.BtcWallet.generateEncryptedVault(mnemonic, 'password');
        const decryptedVault = await hippocrat.BtcWallet.decryptVault(encryptedVault, 'password');
        // Then
        assert.strictEqual(mnemonic, decryptedVault);
    });
});
