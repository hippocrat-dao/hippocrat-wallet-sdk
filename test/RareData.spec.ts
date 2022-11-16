import * as assert from "assert";
import { describe, it } from 'mocha';
import BtcWallet from "../src/BtcWallet.js";
import RareData from "../src/RareData.js";
import { BIP32Interface } from "bip32";

describe('ECIES data encrypt/decrypt test', () => {
    it('data should be same after encrypt-decrypt process', async() => {

        const mnemonic : string = await BtcWallet.generateWalletMnemonic();
        const btcAccountPotential : BIP32Interface = await BtcWallet.getChildFromMnemonic(mnemonic);
        const publicKey : string = (btcAccountPotential.publicKey as Buffer).toString('hex');
        const privateKey : string = (btcAccountPotential.privateKey as Buffer).toString('hex');
        const data : string = "rare data";
        
        const encryptedData : eccrypto.Ecies = await RareData.encryptData(publicKey, data);
        const decryptedData : string = await RareData.decryptData(privateKey, encryptedData);

        assert.strictEqual(data, decryptedData);
    })
})
