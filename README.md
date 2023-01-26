# hippocrat-wallet-sdk

## start

- `$ npm install`

hippocrat wallet sdk which supports bitcoin, its layer2(ION, liquid, lightning) and cryptographic tool

## BtcWallet

- [generate HD wallet mnemonic](https://github.com/hippocrat-dao/hippocrat-wallet-sdk/blob/develop/test/BtcWallet.spec.ts#L5)

- [derive BTC account(BIP44[m/44/0/account_index]) From mnemonic](https://github.com/hippocrat-dao/hippocrat-wallet-sdk/blob/develop/test/BtcWallet.spec.ts#L15)

- [derive BTC address(BIP44[m/44/0/account_index/0/address_index]) From BTC account](https://github.com/hippocrat-dao/hippocrat-wallet-sdk/blob/develop/test/BtcWallet.spec.ts#L27)

- [generate bitcoin address(segwit, starting from "bc1") string from BTC address](https://github.com/hippocrat-dao/hippocrat-wallet-sdk/blob/develop/test/BtcWallet.spec.ts#L40)

- [encrypt & decrypt mnemonic to generate secure vault(scrypt & aes implemented)](https://github.com/hippocrat-dao/hippocrat-wallet-sdk/blob/develop/test/BtcWallet.spec.ts#L55)

## BtcPayment

- [get Bitcoin Signer to sign BTC transaction from mnemonic](https://github.com/hippocrat-dao/hippocrat-wallet-sdk/blob/develop/test/BtcPayment.spec.ts#L5)

- [make transaction to write messages on BTC as OP_RETURN](https://github.com/hippocrat-dao/hippocrat-wallet-sdk/blob/develop/test/BtcPayment.spec.ts#L26)

- [make transaction to transfer BTC to target addresses](https://github.com/hippocrat-dao/hippocrat-wallet-sdk/blob/develop/test/BtcPayment.spec.ts#L49)

## IonDid

- [generate ION key pair from BTC account, based on secp256k1](https://github.com/hippocrat-dao/hippocrat-wallet-sdk/blob/develop/test/IonDid.spec.ts#L5)

- [create ION DID instance to anchor](https://github.com/hippocrat-dao/hippocrat-wallet-sdk/blob/develop/test/IonDid.spec.ts#L22)

- [get ION DID uri(long&short)](https://github.com/hippocrat-dao/hippocrat-wallet-sdk/blob/develop/test/IonDid.spec.ts#L56)

- [anchor ION DID on ION node(will later be published on BTC)](https://github.com/hippocrat-dao/hippocrat-wallet-sdk/blob/develop/test/IonDid.spec.ts#L92)

- [get resolved(either anchored on ION or published on BTC) ION DID](https://github.com/hippocrat-dao/hippocrat-wallet-sdk/blob/develop/test/IonDid.spec.ts#L126)

- [convert json web key to hex key format](https://github.com/hippocrat-dao/hippocrat-wallet-sdk/blob/develop/test/IonDid.spec.ts#L140)

- [sign & verify message with ION DID](https://github.com/hippocrat-dao/hippocrat-wallet-sdk/blob/develop/test/IonDid.spec.ts#L156)

## RareData

- [encrypt & decrypt data following ECIES(AES-GCM with ECDH derived key)](https://github.com/hippocrat-dao/hippocrat-wallet-sdk/blob/develop/test/RareData.spec.ts#L5)