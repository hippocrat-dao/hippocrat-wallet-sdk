import * as assert from "assert";
import { describe, it } from 'mocha';
import BIP32Interface from "../sdk/models/BIP32Interface.js";
import BtcWallet from "../sdk/BtcWallet.js";
import BtcNetwork from "../sdk/enums/BtcNetwork.js";

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

describe('Btc address generator test', () => {
    it('should return segwit address with 21 bytes hex with prefix "bc1"', async() => {
        const mnemonic : string = await BtcWallet.generateWalletMnemonic();
        const btcAccountPotential : BIP32Interface = await BtcWallet.getChildFromMnemonic(mnemonic);
        const btcNetwork : BtcNetwork = BtcNetwork.Mainnet;
        const btcAddress : string = await BtcWallet.generateBtcAddressFromAccount(
            btcAccountPotential, btcNetwork);

        assert.strictEqual(btcAddress.length, 42);
        assert.strictEqual(btcAddress.slice(0, 3), "bc1");
    })
})

describe('Mnemonic encrypt/decrypt test', () => {
    it('mnemonic should be same after encryptioin-decryption process', async() => {
        const mnemonic : string = await BtcWallet.generateWalletMnemonic();
        const encryptedVault : Buffer = await BtcWallet.generateEncryptedVault(
            mnemonic, "password");
        const decryptedVault : string = await BtcWallet.decryptVault(
            encryptedVault, "password");

        assert.strictEqual(mnemonic, decryptedVault);
    })
})