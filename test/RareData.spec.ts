import * as assert from "assert";
import { describe, it } from 'mocha';
import * as hipocrat from '../index.js'

describe('ECIES data encrypt/decrypt test', () => {
    it('data should be same after encrypt-decrypt process', async() => {
        // Given
        const mnemonic : string = await hipocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential : hipocrat.BIP32Interface = await hipocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const publicKeyTo : string = (btcAccountPotential.publicKey as Buffer).toString('hex');
        const privateKey : string = (btcAccountPotential.privateKey as Buffer).toString('hex');
        const data : string = "rare data";
        // When
        const encryptedData : hipocrat.ECIES = await hipocrat.RareData.encryptData(publicKeyTo, data);
        const decryptedData : string = await hipocrat.RareData.decryptData(privateKey, encryptedData);
        // Then
        assert.strictEqual(data, decryptedData);
    })
})

describe('ECDH+AES(with fixed key) data encrypt/decrypt test', () => {
    it('shared data should be same after encrypt-decrypt process', async() => {
        // Given
        const mnemonic_A : string = await hipocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential_A : hipocrat.BIP32Interface = await hipocrat.BtcWallet.getChildFromMnemonic(mnemonic_A);
        const publicKey_A : string = (btcAccountPotential_A.publicKey as Buffer).toString('hex');
        const privateKey_A : string = (btcAccountPotential_A.privateKey as Buffer).toString('hex');
        const mnemonic_B : string = await hipocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential_B : hipocrat.BIP32Interface = await hipocrat.BtcWallet.getChildFromMnemonic(mnemonic_B);
        const publicKey_B : string = (btcAccountPotential_B.publicKey as Buffer).toString('hex');
        const privateKey_B : string = (btcAccountPotential_B.privateKey as Buffer).toString('hex');
        const sharedData : string = "shared rare data";
        // When
        const encryptedSharedDataFromA : Buffer =  await hipocrat.RareData.encryptDataShared(
            privateKey_A, publicKey_B, sharedData);
        const decryptedSharedDataByA : string =  await hipocrat.RareData.decryptDataShared(
            privateKey_A, publicKey_B, encryptedSharedDataFromA);
        const decryptedSharedDataByB : string =  await hipocrat.RareData.decryptDataShared(
            privateKey_B, publicKey_A, encryptedSharedDataFromA);
        // Then
        assert.strictEqual(decryptedSharedDataByA, sharedData);
        assert.strictEqual(decryptedSharedDataByA, decryptedSharedDataByB);
    })
})