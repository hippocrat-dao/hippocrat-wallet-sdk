import * as assert from "assert";
import { describe, it } from 'mocha';
import * as hipocrat from "../index.js";

describe('Mnemonic generator test', () => {
    it('should return 12 words mnemonic', async() => {
        const mnemonic : string = await hipocrat.BtcWallet.generateWalletMnemonic();
        const mnemonicArr : string[] = mnemonic.split(" ");
        assert.strictEqual(mnemonicArr.length, 12);
    })
})

describe('Child BIP32 generator test', () => {
    it('should return bip32 with 32 bytes hex private key', async() => {
        const mnemonic : string = await hipocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential : hipocrat.BIP32Interface = await hipocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const privateKey : string = (btcAccountPotential.privateKey as Buffer).toString('hex');
        assert.strictEqual(privateKey.length, 64);
    })
})

describe('Grandchild BIP32 generator test', () => {
    it('should return bip32 with 32 bytes hex private key', async() => {
        const mnemonic : string = await hipocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotentialParent : hipocrat.BIP32Interface = await hipocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const btcAccountPotentialChild : hipocrat.BIP32Interface = await hipocrat.BtcWallet.getChildFromAccount(btcAccountPotentialParent);
        const privateKey : string = (btcAccountPotentialChild.privateKey as Buffer).toString('hex');
        assert.strictEqual(privateKey.length, 64);
    })
})

describe('Btc address generator test', () => {
    it('should return segwit address with 21 bytes hex with prefix "bc1"', async() => {
        const mnemonic : string = await hipocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential : hipocrat.BIP32Interface = await hipocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const btcNetwork : hipocrat.BtcNetwork = hipocrat.BtcNetwork.Mainnet;
        const btcAddress : string = await hipocrat.BtcWallet.generateBtcAddressFromAccount(
            btcAccountPotential, btcNetwork);

        assert.strictEqual(btcAddress.length, 42);
        assert.strictEqual(btcAddress.slice(0, 3), "bc1");
    })
})

describe('Mnemonic encrypt/decrypt test', () => {
    it('mnemonic should be same after encryptioin-decryption process', async() => {
        const mnemonic : string = await hipocrat.BtcWallet.generateWalletMnemonic();
        const encryptedVault : Buffer = await hipocrat.BtcWallet.generateEncryptedVault(
            mnemonic, "password");
        const decryptedVault : string = await hipocrat.BtcWallet.decryptVault(
            encryptedVault, "password");

        assert.strictEqual(mnemonic, decryptedVault);
    })
})