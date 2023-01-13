import * as assert from "assert";
import { describe, it } from 'mocha';
import * as hippocrat from '../index.js'

describe('ECIES data encrypt/decrypt test', () => {
    it('data should be same after encrypt-decrypt process', async() => {
        // Given
        const mnemonic : string = await hippocrat.BtcWallet.generateWalletMnemonic();
        const nonBtcAccountPotential : hippocrat.BtcAccount = await hippocrat.BtcWallet.getNonBtcAccountFromMnemonic(mnemonic, 1, 0);
        const publicKeyTo : string = (nonBtcAccountPotential.publicKey as Buffer).toString('hex');
        const privateKey : string = (nonBtcAccountPotential.privateKey as Buffer).toString('hex');
        const data : string = "rare data";
        // When
        const encryptedData : string = await hippocrat.RareData.encryptData(publicKeyTo, data);
        const decryptedData : string = await hippocrat.RareData.decryptData(privateKey, encryptedData);
        // Then
        assert.strictEqual(data, decryptedData);
    })
})

describe('ECDH+AES(with fixed key) data encrypt/decrypt test', () => {
    it('shared data should be same after encrypt-decrypt process', async() => {
        // Given
        const mnemonic_A : string = await hippocrat.BtcWallet.generateWalletMnemonic();
        const nonBtcAccountPotential_A : hippocrat.BtcAccount = await hippocrat.BtcWallet.getNonBtcAccountFromMnemonic(mnemonic_A, 1, 1);
        const publicKey_A : string = (nonBtcAccountPotential_A.publicKey as Buffer).toString('hex');
        const privateKey_A : string = (nonBtcAccountPotential_A.privateKey as Buffer).toString('hex');
        const mnemonic_B : string = await hippocrat.BtcWallet.generateWalletMnemonic();
        const nonBtcAccountPotential_B : hippocrat.BtcAccount = await hippocrat.BtcWallet.getNonBtcAccountFromMnemonic(mnemonic_B, 1, 2);
        const publicKey_B : string = (nonBtcAccountPotential_B.publicKey as Buffer).toString('hex');
        const privateKey_B : string = (nonBtcAccountPotential_B.privateKey as Buffer).toString('hex');
        const sharedData : string = "shared rare data";
        // When
        const encryptedSharedDataFromA : string =  await hippocrat.RareData.encryptDataShared(
            privateKey_A, publicKey_B, sharedData);
        const decryptedSharedDataByA : string =  await hippocrat.RareData.decryptDataShared(
            privateKey_A, publicKey_B, encryptedSharedDataFromA);
        const decryptedSharedDataByB : string =  await hippocrat.RareData.decryptDataShared(
            privateKey_B, publicKey_A, encryptedSharedDataFromA);
        // Then
        assert.strictEqual(decryptedSharedDataByA, sharedData);
        assert.strictEqual(decryptedSharedDataByA, decryptedSharedDataByB);
    })
})