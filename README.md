# hippocrat-wallet-sdk

**Bitcoin, Hippocrat, DID and Data Wallet SDK for Node, Browser and Mobile**

_Easy Peasy Lemon Squeezy to Use. Including_

- generate, encrypt and decrypt mnemonic (following bip39)
- derive account, address, and child of address (following bip32, bip44 and bip84)
- make transaction on Bitcoin either to transfer Bitcoin or write data on Bitcoin
- make transaction on Ethereum to transfer Hippocrat token
- encrypt & decrypt data following ECIES (AES-GCM with ECDH derived key)
- create [Hippocrat(HPO) DID](https://github.com/w3c/did-spec-registries/blob/main/methods/hpo.json) from mnemonic

...and more!

## Install

Will be published on NPM soon! You can clone and install to use for now.

## [BtcWallet](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/BtcWallet.spec.ts)

- generate HD wallet mnemonic

- derive Bitcoin account level BtcAccount From mnemonic (BIP84[m/84'/0'/account_index'])

- derive Bitcoin address level BtcAccount From Bitcoin account level BtcAccount (BIP84[m/84'/0'/account_index'/change_index/address_index])

- generate Bitcoin address string from BtcAccount (Segwit, starting from "bc1")

- encrypt & decrypt mnemonic to generate secure vault (scrypt & aes-gcm)

## [BtcPayment](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/BtcPayment.spec.ts)

- get Bitcoin signer to sign Bitcoin transaction from mnemonic

- make transaction to write messages on Bitcoin as OP_RETURN

- make transaction to transfer Bitcoin to target addresses

## [HpoPayment](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/HpoPayment.spec.ts)

- make transaction to transfer Hippocrat to target addresses

## [RareData](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/RareData.spec.ts)

- encrypt & decrypt data following ECIES (AES-GCM with ECDH derived key)

## [HpoDid](https://github.com/hippocrat-protocol/hippocrat-wallet-sdk/blob/develop/test/HpoDid.spec.ts)

- create HPO DID
