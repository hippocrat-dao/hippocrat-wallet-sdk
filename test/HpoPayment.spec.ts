import * as assert from 'assert';
import { describe, it } from 'mocha';
import * as hippocrat from '../index.js';

describe('HPO payment test', () => {
	it('HPO payment is to transfer HPO token', async () => {
		// Given
		const mnemonic: string = await hippocrat.BtcWallet.generateWalletMnemonic();
		const nonBtcAccountPotential: hippocrat.BtcAccount =
			await hippocrat.BtcWallet.getNonBtcAccountFromMnemonic(mnemonic, 1, 0);
		// When
		const tx = await hippocrat.HpoPayment.transferHpo(
			nonBtcAccountPotential.privateKey as Buffer,
			1,
			'0x40CB4DA705a044016e66dB2E30AdE93EbFe4abD4', // HPO deployer address
		);
		// then (this will fail as signer does not have either HPO or ethereum)
		assert.strictEqual(tx.to, '0x40CB4DA705a044016e66dB2E30AdE93EbFe4abD4');
	});
});
