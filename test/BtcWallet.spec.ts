import * as assert from "assert";
import { BIP32Interface } from "bip32";
import { describe, it } from 'mocha';
import BtcWallet from "../src/BtcWallet.js";

describe('Mnemonic generator test', () => {
    it('should return 12 words mnemonic', async() => {
        const mnemonic : string = await BtcWallet.generateWalletMnemonic();
        const mnemonicArr : string[] = mnemonic.split(" ");
        assert.strictEqual(mnemonicArr.length, 12);
    })
})

describe('Child BIP32 generator test', () => {
    it('should return bip32 with 32 bytes hex private key', async() => {
        const mnemonic : string = await BtcWallet.generateWalletMnemonic();
        const btcAccountPotential : BIP32Interface = await BtcWallet.getChildFromMnemonic(mnemonic);
        const privateKey : string = (btcAccountPotential.privateKey as Buffer).toString('hex');
        assert.strictEqual(privateKey.length, 64);
    })
})

describe('Grandchild BIP32 generator test', () => {
    it('should return bip32 with 32 bytes hex private key', async() => {
        const mnemonic : string = await BtcWallet.generateWalletMnemonic();
        const btcAccountPotentialParent : BIP32Interface = await BtcWallet.getChildFromMnemonic(mnemonic);
        const btcAccountPotentialChild : BIP32Interface = await BtcWallet.getChildFromAccount(btcAccountPotentialParent);
        const privateKey : string = (btcAccountPotentialChild.privateKey as Buffer).toString('hex');
        assert.strictEqual(privateKey.length, 64);
    })
})