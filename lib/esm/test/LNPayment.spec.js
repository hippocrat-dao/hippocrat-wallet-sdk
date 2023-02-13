import * as assert from "assert";
import { describe, it } from 'mocha';
import * as hippocrat from '../index.js';
describe('LNPayment create invoice test', () => {
    it('invoice pub key should be pub key of signer', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential = await hippocrat.BtcWallet.getAccountFromMnemonic(mnemonic);
        const btcAddressPotential = await hippocrat.BtcWallet.getAddressFromAccount(btcAccountPotential);
        const lightningIndex = 0; // 0 is default, let's use address child for LNPayment
        const LNSigner = await hippocrat.BtcWallet.getChildFromAddress(btcAddressPotential, lightningIndex);
        const btcAddressString = await hippocrat.BtcWallet.generateBtcAddress(LNSigner);
        // When
        const bolt11 = await hippocrat.LNPayment.createInvoice(LNSigner.privateKey.toString('hex'), 1, // satoshi to request
        "preimage", // preimage to reveal(must be 32 random bytes)
        btcAddressString, // fallback btc address
        "paymentSecret" // paymentSecret to reveal(must be 32 random bytes)
        );
        // Then
        assert.strictEqual(bolt11.payeeNodeKey, LNSigner.publicKey.toString('hex'));
    });
});
