import * as assert from "assert";
import { describe, it } from 'mocha';
import * as hippocrat from "../index.js";

describe('Mnemonic generator test', () => {
    it('should return 12 words mnemonic', async() => {
        // When
        const mnemonic : string = await hippocrat.BtcWallet.generateWalletMnemonic();
        const mnemonicArr : string[] = mnemonic.split(" ");
        // Then
        assert.strictEqual(mnemonicArr.length, 12);
    })
})

describe('Child BtcAccount(BIP32) generator test', () => {
    it('should return btcAccount(bip32) with 32 bytes hex private key', async() => {
        // Given
        const mnemonic : string = await hippocrat.BtcWallet.generateWalletMnemonic();
        // When
        const btcAccountPotential : hippocrat.BtcAccount = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const privateKey : string = (btcAccountPotential.privateKey as Buffer).toString('hex');
        // Then
        assert.strictEqual(privateKey.length, 64);
    })
})

describe('Grandchild BtcAccount(BIP32) generator test', () => {
    it('should return btcAccount(bip32) with 32 bytes hex private key', async() => {
        // Given
        const mnemonic : string = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotentialParent : hippocrat.BtcAccount = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        // When
        const btcAccountPotentialChild : hippocrat.BtcAccount = await hippocrat.BtcWallet.getChildFromAccount(btcAccountPotentialParent);
        const privateKey : string = (btcAccountPotentialChild.privateKey as Buffer).toString('hex');
        // Then
        assert.strictEqual(privateKey.length, 64);
    })
})

describe('Btc address generator test', () => {
    it('should return segwit address with 21 bytes hex with prefix "bc1"', async() => {
        // Given
        const mnemonic : string = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential : hippocrat.BtcAccount = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const btcNetwork : hippocrat.BtcNetwork = hippocrat.BtcNetwork.Mainnet;
        // When
        const btcAddress : string = await hippocrat.BtcWallet.generateBtcAddressFromAccount(
            btcAccountPotential, btcNetwork);
        // Then
        assert.strictEqual(btcAddress.length, 42);
        assert.strictEqual(btcAddress.slice(0, 3), "bc1");
    })
})

describe('Mnemonic encrypt/decrypt test', () => {
    it('mnemonic should be same after encryptioin-decryption process', async() => {
        // Given
        const mnemonic : string = await hippocrat.BtcWallet.generateWalletMnemonic();
        // When
        const encryptedVault : string = await hippocrat.BtcWallet.generateEncryptedVault(
            mnemonic, "password");
        const decryptedVault : string = await hippocrat.BtcWallet.decryptVault(
            encryptedVault, "password");
        // Then
        assert.strictEqual(mnemonic, decryptedVault);
    })
})