import * as assert from 'assert';
import { describe, it } from 'mocha';
import * as hippocrat from '../index.js';
describe('HPO DID create test', () => {
    it('HPO DID document should meet the spec', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential = await hippocrat.BtcWallet.getAccountFromMnemonic(mnemonic, 0);
        const btcAddressPotential = await hippocrat.BtcWallet.getAddressFromAccount(btcAccountPotential, 0);
        const hpoDidPotential = await hippocrat.BtcWallet.getChildFromAddress(btcAddressPotential, 0);
        const hpoDid = await hippocrat.HpoDid.create(hpoDidPotential.privateKey?.toString('hex'));
        // When
        const pubKeyHex = hpoDidPotential.publicKey.toString('hex');
        // Then
        assert.strictEqual(hpoDid.id.slice(0, 8), 'did:hpo:');
        assert.strictEqual(hpoDid.id.slice(8), pubKeyHex);
    });
});
describe('HPO DID sign and verify test', () => {
    it('HPO DID is signable', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential = await hippocrat.BtcWallet.getAccountFromMnemonic(mnemonic, 0);
        const btcAddressPotential = await hippocrat.BtcWallet.getAddressFromAccount(btcAccountPotential, 0);
        const hpoDidPotential = await hippocrat.BtcWallet.getChildFromAddress(btcAddressPotential, 0);
        const hpoDid = await hippocrat.HpoDid.create(hpoDidPotential.privateKey?.toString('hex'));
        const publicKey = hpoDid.id.slice(8);
        // When
        const signature = await hippocrat.HpoDid.sign(hpoDidPotential.privateKey?.toString('hex'));
        const isValidSignature = await hippocrat.HpoDid.verify(publicKey, signature);
        // Then
        assert.strictEqual(isValidSignature, true);
    });
});
