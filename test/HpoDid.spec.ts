import * as assert from 'assert';
import { describe, it } from 'mocha';
import * as hippocrat from '../index.js';

describe('HPO DID create test', () => {
	it('HPO DID document should meet the spec', async () => {
		// Given
		const mnemonic: string = await hippocrat.BtcWallet.generateWalletMnemonic();
		const btcAccountPotential: hippocrat.BtcAccount =
			await hippocrat.BtcWallet.getAccountFromMnemonic(mnemonic, 0);
		const btcAddressPotential: hippocrat.BtcAccount =
			await hippocrat.BtcWallet.getAddressFromAccount(btcAccountPotential, 0);
		const hpoDidPotential: hippocrat.BtcAccount =
			await hippocrat.BtcWallet.getChildFromAddress(btcAddressPotential, 0);
		const hpoDid: hippocrat.HpoDidModel = await hippocrat.HpoDid.create(
			hpoDidPotential.privateKey as Buffer,
		);
		// When
		const pubKeyHex: string = hpoDidPotential.publicKey.toString('hex');
		// Then
		assert.strictEqual(hpoDid.id.slice(0, 8), 'did:hpo:');
		assert.strictEqual(hpoDid.id.slice(8), pubKeyHex);
	});
});

describe('HPO DID sign and verify test', () => {
	it('HPO DID is signable', async () => {
		// Given
		const mnemonic: string = await hippocrat.BtcWallet.generateWalletMnemonic();
		const btcAccountPotential: hippocrat.BtcAccount =
			await hippocrat.BtcWallet.getAccountFromMnemonic(mnemonic, 0);
		const btcAddressPotential: hippocrat.BtcAccount =
			await hippocrat.BtcWallet.getAddressFromAccount(btcAccountPotential, 0);
		const hpoDidPotential: hippocrat.BtcAccount =
			await hippocrat.BtcWallet.getChildFromAddress(btcAddressPotential, 0);
		const hpoDid: hippocrat.HpoDidModel = await hippocrat.HpoDid.create(
			hpoDidPotential.privateKey as Buffer,
		);
		const publicKey: string = hpoDid.id.slice(8);
		// When
		const signature: string = await hippocrat.HpoDid.sign(
			hpoDidPotential.privateKey as Buffer,
		);
		const isValidSignature: boolean = await hippocrat.HpoDid.verify(
			publicKey,
			signature,
		);
		// Then
		assert.strictEqual(isValidSignature, true);
	});
});
