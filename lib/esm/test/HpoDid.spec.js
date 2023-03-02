import * as assert from "assert";
import { describe, it } from 'mocha';
import * as hippocrat from '../index.js';
describe('HPO DID create test', () => {
    it('HPO DID document should meet the spec', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const nonBtcAccountPotential = await hippocrat.BtcWallet.getNonBtcAccountFromMnemonic(mnemonic, 0, 0);
        const hpoDid = await hippocrat.HpoDid.createDid(mnemonic);
        // When
        const pubKeyHex = nonBtcAccountPotential.publicKey.toString('hex');
        // Then
        console.log(hpoDid);
        assert.strictEqual(hpoDid.id.slice(0, 8), 'did:hpo:');
        assert.strictEqual(hpoDid.id.slice(8), pubKeyHex);
    });
});
