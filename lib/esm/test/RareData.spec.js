import * as assert from "assert";
import { describe, it } from 'mocha';
import * as hippocrat from '../index.js';
describe('ECIES data encrypt/decrypt test', () => {
    it('data should be same after encrypt-decrypt process', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const nonBtcAccountPotential = await hippocrat.BtcWallet.getNonBtcAccountFromMnemonic(mnemonic, 1, 0);
        const publicKeyTo = nonBtcAccountPotential.publicKey.toString('hex');
        const privateKey = nonBtcAccountPotential.privateKey.toString('hex');
        const data = "rare data";
        // When
        const encryptedData = await hippocrat.RareData.encryptData(publicKeyTo, data);
        const decryptedData = await hippocrat.RareData.decryptData(privateKey, encryptedData);
        // Then
        assert.strictEqual(data, decryptedData);
    });
});
describe('ECDH+AES(with fixed key) data encrypt/decrypt test', () => {
    it('shared data should be same after encrypt-decrypt process', async () => {
        // Given
        const mnemonic_A = await hippocrat.BtcWallet.generateWalletMnemonic();
        const nonBtcAccountPotential_A = await hippocrat.BtcWallet.getNonBtcAccountFromMnemonic(mnemonic_A, 1, 1);
        const publicKey_A = nonBtcAccountPotential_A.publicKey.toString('hex');
        const privateKey_A = nonBtcAccountPotential_A.privateKey.toString('hex');
        const mnemonic_B = await hippocrat.BtcWallet.generateWalletMnemonic();
        const nonBtcAccountPotential_B = await hippocrat.BtcWallet.getNonBtcAccountFromMnemonic(mnemonic_B, 1, 2);
        const publicKey_B = nonBtcAccountPotential_B.publicKey.toString('hex');
        const privateKey_B = nonBtcAccountPotential_B.privateKey.toString('hex');
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
