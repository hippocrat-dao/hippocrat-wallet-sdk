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
