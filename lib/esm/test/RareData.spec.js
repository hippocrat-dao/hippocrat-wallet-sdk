import * as assert from "assert";
import { describe, it } from 'mocha';
import * as hippocrat from '../index.js';
describe('ECIES data encrypt/decrypt test', () => {
    it('data should be same after encrypt-decrypt process', async () => {
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
describe('ECDH+AES(with fixed key) data encrypt/decrypt test', () => {
    it('shared data should be same after encrypt-decrypt process', async () => {
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
