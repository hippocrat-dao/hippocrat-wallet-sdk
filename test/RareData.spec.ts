import * as assert from "assert";
import { describe, it } from 'mocha';
import * as hipocrat from '../index.js'

describe('ECIES data encrypt/decrypt test', () => {
    it('data should be same after encrypt-decrypt process', async() => {

        const mnemonic : string = await hipocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential : hipocrat.BIP32Interface = await hipocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const publicKeyTo : string = (btcAccountPotential.publicKey as Buffer).toString('hex');
        const privateKey : string = (btcAccountPotential.privateKey as Buffer).toString('hex');
        const data : string = "rare data";
        
        const encryptedData : hipocrat.ECIES = await hipocrat.RareData.encryptData(publicKeyTo, data);
        const decryptedData : string = await hipocrat.RareData.decryptData(privateKey, encryptedData);

        assert.strictEqual(data, decryptedData);
    })
})

describe('ECDH+AES(with fixed key) data encrypt/decrypt test', () => {
    it('shared data should be same after encrypt-decrypt process', async() => {

        const mnemonic_A : string = await hipocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential_A : hipocrat.BIP32Interface = await hipocrat.BtcWallet.getChildFromMnemonic(mnemonic_A);
        const publicKey_A : string = (btcAccountPotential_A.publicKey as Buffer).toString('hex');
        const privateKey_A : string = (btcAccountPotential_A.privateKey as Buffer).toString('hex');
        const mnemonic_B : string = await hipocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential_B : hipocrat.BIP32Interface = await hipocrat.BtcWallet.getChildFromMnemonic(mnemonic_B);
        const publicKey_B : string = (btcAccountPotential_B.publicKey as Buffer).toString('hex');
        const privateKey_B : string = (btcAccountPotential_B.privateKey as Buffer).toString('hex');

        const sharedData : string = "shared rare data";
        
        const encryptedSharedDataFromA : Buffer =  await hipocrat.RareData.encryptDataShared(
            privateKey_A, publicKey_B, sharedData);
        const decryptedSharedDataFromA : string =  await hipocrat.RareData.decryptDataShared(
            privateKey_A, publicKey_B, encryptedSharedDataFromA);
        const encryptedSharedDataFromB : Buffer =  await hipocrat.RareData.encryptDataShared(
            privateKey_B, publicKey_A, sharedData);
        const decryptedSharedDataFromB : string =  await hipocrat.RareData.decryptDataShared(
            privateKey_B, publicKey_A, encryptedSharedDataFromB);

        assert.strictEqual(decryptedSharedDataFromA, sharedData);
        assert.strictEqual(decryptedSharedDataFromA, decryptedSharedDataFromB);
    })
})