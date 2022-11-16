import * as assert from "assert";
import { describe, it } from 'mocha';
import BtcWallet from "../src/BtcWallet.js";
import RareData from "../src/RareData.js";
import { BIP32Interface } from "bip32";

describe('ECIES data encrypt/decrypt test', () => {
    it('data should be same after encrypt-decrypt process', async() => {

        const mnemonic : string = await BtcWallet.generateWalletMnemonic();
        const btcAccountPotential : BIP32Interface = await BtcWallet.getChildFromMnemonic(mnemonic);
        const publicKeyTo : string = (btcAccountPotential.publicKey as Buffer).toString('hex');
        const privateKey : string = (btcAccountPotential.privateKey as Buffer).toString('hex');
        const data : string = "rare data";
        
        const encryptedData : eccrypto.Ecies = await RareData.encryptData(publicKeyTo, data);
        const decryptedData : string = await RareData.decryptData(privateKey, encryptedData);

        assert.strictEqual(data, decryptedData);
    })
})

describe('ECDH+AES(with fixed key) data encrypt/decrypt test', () => {
    it('shared data should be same after encrypt-decrypt process', async() => {

        const mnemonic_A : string = await BtcWallet.generateWalletMnemonic();
        const btcAccountPotential_A : BIP32Interface = await BtcWallet.getChildFromMnemonic(mnemonic_A);
        const publicKey_A : string = (btcAccountPotential_A.publicKey as Buffer).toString('hex');
        const privateKey_A : string = (btcAccountPotential_A.privateKey as Buffer).toString('hex');
        const mnemonic_B : string = await BtcWallet.generateWalletMnemonic();
        const btcAccountPotential_B : BIP32Interface = await BtcWallet.getChildFromMnemonic(mnemonic_B);
        const publicKey_B : string = (btcAccountPotential_B.publicKey as Buffer).toString('hex');
        const privateKey_B : string = (btcAccountPotential_B.privateKey as Buffer).toString('hex');

        const sharedData : string = "shared rare data";
        
        const encryptedSharedDataFromA : Buffer =  await RareData.encryptDataShared(
            privateKey_A, publicKey_B, sharedData);
        const decryptedSharedDataFromA : string =  await RareData.decryptDataShared(
            privateKey_A, publicKey_B, encryptedSharedDataFromA);
        const encryptedSharedDataFromB : Buffer =  await RareData.encryptDataShared(
            privateKey_B, publicKey_A, sharedData);
        const decryptedSharedDataFromB : string =  await RareData.decryptDataShared(
            privateKey_B, publicKey_A, encryptedSharedDataFromB);

        assert.strictEqual(decryptedSharedDataFromA, sharedData);
        assert.strictEqual(decryptedSharedDataFromA, decryptedSharedDataFromB);
    })
})