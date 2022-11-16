# hipocrat-wallet-sdk

## start

- `$ npm install`

Hipocrat wallet sdk which supports bitcoin, its layer2(ION, liquid, lightning) and cryptographic tool

## BtcWallet

- [generate HD wallet mnemonic](https://github.com/hipocrat-dao/hipocrat-wallet-sdk/blob/develop/test/BtcWallet.spec.ts)

- [derive BIP32 account From mnemonic](https://github.com/hipocrat-dao/hipocrat-wallet-sdk/blob/develop/test/BtcWallet.spec.ts)

- [derive child BIP32 account From parent BIP32 account](https://github.com/hipocrat-dao/hipocrat-wallet-sdk/blob/develop/test/BtcWallet.spec.ts)

- [generate bitcoin address from BIP32 account](https://github.com/hipocrat-dao/hipocrat-wallet-sdk/blob/develop/test/BtcWallet.spec.ts)

- [encrypt & decrypt mnemonic to store vault securely](https://github.com/hipocrat-dao/hipocrat-wallet-sdk/blob/develop/test/BtcWallet.spec.ts)

## RareData

- [encrypt & decrypt data following ECIES(AES-GCM with temporary ECDH derived key)](https://github.com/hipocrat-dao/hipocrat-wallet-sdk/blob/develop/test/RareData.spec.ts)

- [encrypt & decrypt data following AES-GCM with fixed ECDH derived key](https://github.com/hipocrat-dao/hipocrat-wallet-sdk/blob/develop/test/RareData.spec.ts)