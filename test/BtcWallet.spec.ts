import * as assert from "assert";
import { describe, it } from 'mocha';
import BtcWallet from "../src/BtcWallet.js";

describe('Mnemonic generator test', () => {
    it('should return 12 words mnemonic', async() => {
        const mnemonic : string = await BtcWallet.generateWalletMnemonic();
        const mnemonicArr : string[] = mnemonic.split(" ");
        assert.strictEqual(mnemonicArr.length, 12);
    })
})