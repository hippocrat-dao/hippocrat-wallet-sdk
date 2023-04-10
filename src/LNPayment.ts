import * as bolt11 from 'bolt11';
import { crypto } from 'bitcoinjs-lib';
import { Buffer } from 'buffer';
import BOLT11 from './models/BOLT11';

class LNPayment {
	static createInvoice = async (
		privKey: string,
		amount: number,
		preimage: string,
		btcAddress: string,
		paymentSecret: string,
	): Promise<BOLT11> => {
		/*
      There's no "address" in lightning network.
      Pay to lightning node pubic key.
      Only way to receive satoshi is by creating invoice.
    */
		const encoded: BOLT11 = bolt11.encode({
			satoshis: amount,
			tags: [
				{
					tagName: 'description',
					data: 'heartbit reward',
				},
				{
					tagName: 'payment_hash',
					data: crypto.sha256(Buffer.from(preimage)).toString('hex'), // hash of preimage(32 random bytes)
				},
				{
					tagName: 'fallback_address',
					data: {
						address: btcAddress,
					},
				},
				{
					tagName: 'payment_secret',
					data: paymentSecret, // Make sure the amount the sender intends to pay is actually received by the recipient.
				},
				{
					tagName: 'min_final_cltv_expiry',
					data: 18, // 18 is default
				},
			],
		} as BOLT11);

		return bolt11.sign(encoded, privKey) as BOLT11;
	};
}

export default LNPayment;
