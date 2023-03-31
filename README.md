# hippocrat-wallet-sdk

**Bitcoin, Lightning, Hippocrat DID and Data Wallet SDK for Node, Browser and Mobile**

_Easy Peasy Lemon Squeezy to Use. Including_

- generate, encrypt and decrypt mnemonic (following bip39)
- derive account, address, and child of address (following bip32, bip44 and bip84)
- make transaction on Bitcoin either to transfer Bitcoin or write data on Bitcoin
- create Lightning invoice with Bitcoin private key (following bolt11)
- encrypt and decrypt data with Bitcoin key pair (following ECIES)
- create Hippocrat(HPO) DID from Bitcoin mnemonic

...and more!

## Install

Will be published on NPM soon! You can clone and install to use for now.

## BtcWallet

- [generate HD wallet mnemonic](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/BtcWallet.spec.ts#L5)

- [derive Bitcoin account level Account From mnemonic (BIP84[m/84'/0'/account_index'])](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/BtcWallet.spec.ts#L15)

- [derive Bitcoin address level Account From Bitcoin account (BIP84[m/84'/0'/account_index'/change_index/address_index])](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/BtcWallet.spec.ts#L27)

- [generate Bitcoin address string from Bitcoin Account (Segwit, starting from "bc1")](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/BtcWallet.spec.ts#L40)

- [encrypt & decrypt mnemonic to generate secure vault (scrypt & aes-gcm)](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/BtcWallet.spec.ts#L55)

## BtcPayment

- [get Bitcoin Signer to sign Bitcoin transaction from mnemonic](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/BtcPayment.spec.ts#L5)

- [make transaction to write messages on Bitcoin as OP_RETURN](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/BtcPayment.spec.ts#L26)

- [make transaction to transfer Bitcoin to target addresses](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/BtcPayment.spec.ts#L49)

## LNPayment

- [create Lightning invoice with Bitcoin private key](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/LNPayment.spec.ts#L5)

## RareData

- [encrypt & decrypt data following ECIES (AES-GCM with ECDH derived key)](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/RareData.spec.ts#L5)

## HpoDid

- [create HPO DID](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/HpoDid.spec.ts#L5)
