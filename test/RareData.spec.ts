import * as assert from 'assert';
import { describe, it } from 'mocha';
import * as hippocrat from '../index.js';

describe('ECIES data encrypt/decrypt test', () => {
	it('data should be same after encrypt-decrypt process', async () => {
		// Given
		const mnemonic: string = await hippocrat.BtcWallet.generateWalletMnemonic();
		const btcAccountPotential: hippocrat.BtcAccount =
			await hippocrat.BtcWallet.getAccountFromMnemonic(mnemonic, 0);
		const btcAddressPotential: hippocrat.BtcAccount =
			await hippocrat.BtcWallet.getAddressFromAccount(btcAccountPotential, 0);
		const rareDataAccount: hippocrat.BtcAccount =
			await hippocrat.BtcWallet.getChildFromAddress(btcAddressPotential, 0);
		const publicKeyTo: string = (rareDataAccount.publicKey as Buffer).toString(
			'hex',
		);
		const privateKey: string = (rareDataAccount.privateKey as Buffer).toString(
			'hex',
		);
		const data: string = 'rare data';
		// When
		const encryptedData: string = await hippocrat.RareData.encryptData(
			publicKeyTo,
			data,
		);
		const decryptedData: string = await hippocrat.RareData.decryptData(
			privateKey,
			encryptedData,
		);
		// Then
		assert.strictEqual(data, decryptedData);
	});
});
