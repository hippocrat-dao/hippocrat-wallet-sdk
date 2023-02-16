# hippocrat-wallet-sdk

**Bitcoin, Lightning, DID and Data Wallet SDK for Node, Browser and Mobile**

*Easy Peasy Lemon Squeezy to Use. Including*

- generate, encrypt and decrypt mnemonic (following bip39)
- derive account, address, and child of address (following bip32 and bip44)
- make transaction on Bitcoin either to transfer Bitcoin or write data on Bitcoin
- create Lightning invoice with Bitcoin private key (following bolt11)
- encrypt and decrypt data with Bitcoin key pair (following ECIES)

...and more!

## Install

Will be published on NPM soon! You can clone and install to use for now.

## BtcWallet

- [generate HD wallet mnemonic](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/BtcWallet.spec.ts#L5)

- [derive Bitcoin account level Account From mnemonic (BIP44[m/44/0/account_index])](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/BtcWallet.spec.ts#L15)

- [derive Bitcoin address level Account From Bitcoin account (BIP44[m/44/0/account_index/0/address_index])](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/BtcWallet.spec.ts#L27)

- [generate Bitcoin address string from Bitcoin Account (Segwit, starting from "bc1")](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/BtcWallet.spec.ts#L40)

- [encrypt & decrypt mnemonic to generate secure vault(scrypt & aes)](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/BtcWallet.spec.ts#L55)

## BtcPayment

- [get Bitcoin Signer to sign Bitcoin transaction from mnemonic](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/BtcPayment.spec.ts#L5)

- [make transaction to write messages on Bitcoin as OP_RETURN](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/BtcPayment.spec.ts#L26)

- [make transaction to transfer Bitcoin to target addresses](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/BtcPayment.spec.ts#L49)

## LNPayment

- [create Lightning invoice with Bitcoin private key](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/LNPayment.spec.ts#L5)

## RareData

- [encrypt & decrypt data following ECIES(AES-GCM with ECDH derived key)](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/RareData.spec.ts#L5)

## IonDid(For Node and Browser only)

- [generate ION key pair from BTC account, based on secp256k1](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/IonDid.spec.ts#L5)

- [create ION DID instance to anchor](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/IonDid.spec.ts#L22)

- [get ION DID uri(long&short)](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/IonDid.spec.ts#L56)

- [anchor ION DID on ION node(will later be published on BTC)](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/IonDid.spec.ts#L92)

- [get resolved(either anchored on ION or published on BTC) ION DID](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/IonDid.spec.ts#L126)

- [convert json web key to hex key format](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/IonDid.spec.ts#L140)

- [sign & verify message with ION DID](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/IonDid.spec.ts#L156)