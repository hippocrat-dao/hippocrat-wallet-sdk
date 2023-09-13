# hippocrat-wallet-sdk

**Bitcoin, Hippocrat, DID and Data Wallet SDK for Node, Browser and Mobile**

_Easy Peasy Lemon Squeezy to Use. Including_

- generate, encrypt and decrypt mnemonic (following bip39)
- derive account, address, and child of address (following bip32, bip44 and bip84)
- make transaction on Bitcoin either to transfer Bitcoin or write data on Bitcoin
- make transaction on Ethereum to transfer Hippocrat token
- encrypt & decrypt data following ECIES (AES-CTR with ECDH derived key)
- create [Hippocrat(HPO) DID](https://github.com/w3c/did-spec-registries/blob/main/methods/hpo.json), sign with DID, verify signature with DID

...and more!

## Install
``` bash
npm install hippocrat-wallet-sdk
```
## [BtcWallet](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/BtcWallet.spec.ts)

- generate HD wallet mnemonic

- derive Bitcoin account level [BtcAccount](https://github.com/hippocrat-dao/hippocrat-wallet-sdk/blob/develop/src/models/BtcAccount.ts) From mnemonic (BIP84[m/84'/0'/account_index'])

- derive Bitcoin address level [BtcAccount](https://github.com/hippocrat-dao/hippocrat-wallet-sdk/blob/develop/src/models/BtcAccount.ts) From Bitcoin account level [BtcAccount](https://github.com/hippocrat-dao/hippocrat-wallet-sdk/blob/develop/src/models/BtcAccount.ts) (BIP84[m/84'/0'/account_index'/change_index/address_index])

- generate Bitcoin address string from [BtcAccount](https://github.com/hippocrat-dao/hippocrat-wallet-sdk/blob/develop/src/models/BtcAccount.ts) (Segwit, starting from "bc1")

- encrypt & decrypt mnemonic to generate secure vault (scrypt & aes-ctr)

## [BtcPayment](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/BtcPayment.spec.ts)

- get Bitcoin signer to sign Bitcoin transaction from mnemonic

- make transaction to write messages on Bitcoin as OP_RETURN

- make transaction to transfer Bitcoin to target addresses

## [HpoPayment](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/HpoPayment.spec.ts)

- make transaction to transfer Hippocrat to target addresses
- generate ethereum address from private key to receive ethereum and hippocrat

## [RareData](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/RareData.spec.ts)

- encrypt & decrypt data following ECIES (AES-CTR with ECDH derived key)

## [HpoDid](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/HpoDid.spec.ts)

- create HPO DID
- sign message with HPO DID private key
- verify signed message(signature) with HPO DID public key
