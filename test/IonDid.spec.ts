import * as assert from "assert";
import { describe, it } from 'mocha';
import BtcWallet from "../sdk/BtcWallet.js";
import IonDid from "../sdk/IonDid.js";
import IonService from '../sdk/models/IonService';
import JsonWebKey2020 from '../sdk/models/JsonWebKey2020';
import IonDidModel from "../sdk/models/IonDidModel.js";
import ionDidResolved from "../sdk/models/IonDidResolved.js";
import { BIP32Interface } from "bip32";

describe('generate ION key pair test', () => {
    it('Ion Key based on secp256k1 can be derived from bip39 mnemonic', async() => {

        const mnemonic : string = await BtcWallet.generateWalletMnemonic();
        const btcAccountPotentialParent : BIP32Interface = await BtcWallet.getChildFromMnemonic(mnemonic);
        const ionAccountPotentialChild : BIP32Interface = await BtcWallet.getChildFromAccount(btcAccountPotentialParent);

        const ionJwkPair : JsonWebKey2020 = await IonDid.generateKeyPair(ionAccountPotentialChild);

        assert.strictEqual(ionJwkPair.id.slice(0,8), "did:key:");
        assert.strictEqual(ionJwkPair.type, "JsonWebKey2020");
        assert.strictEqual(ionJwkPair.controller.slice(0,8), "did:key:");
        assert.strictEqual((ionJwkPair.privateKeyJwk as JsonWebKey).crv, "secp256k1");
        assert.strictEqual(ionJwkPair.publicKeyJwk.crv, "secp256k1");
    })
})

describe('create ION DID test', () => {
    it('check Ion DID format', async() => {

        const mnemonic : string = await BtcWallet.generateWalletMnemonic();
        const btcAccountPotentialParent : BIP32Interface = await BtcWallet.getChildFromMnemonic(mnemonic);
        const ionAccountPotentialChild : BIP32Interface = await BtcWallet.getChildFromAccount(btcAccountPotentialParent);
        
        const ionJwkPair : JsonWebKey2020 = await IonDid.generateKeyPair(ionAccountPotentialChild);
        const ionServices : IonService[] = [
            {
                id: "tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c",
                type: "hipocrat patient wallet",
                serviceEndpoint: "https://blockstream.info/testnet/address/tb1qsww2x6w2mjmdfv3lcr6gxzxfalykrxxsqprpp7"
            },
            {
                id: "tb1qsww2x6w2mjmdfv3lcr6gxzxfalykrxxsqprpp7",
                type: "hipocrat admin wallet",
                serviceEndpoint: "https://blockstream.info/testnet/address/tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c"
            },
            {
                id: "hipocrat0patient0id",
                type: "hipocrat patient data",
                serviceEndpoint: "https://ipfs.io/ipfs/bafybeialzikkahbkmyjegm5tgus3m4izqntr647pf7uqvhglossdop5fau"
            }
        ]

        const IonDID : IonDidModel = await IonDid.createDid(ionJwkPair, ionServices);

        assert.strictEqual(IonDID.operation, 'create');
        assert.strictEqual(IonDID.content.publicKeys[0].publicKeyJwk, ionJwkPair.publicKeyJwk);
        assert.strictEqual(IonDID.content.services, ionServices);

    })
})

describe('get ION DID uri(long & short) test', () => {
    it('check ion did uri in right format', async() => {

        const mnemonic : string = await BtcWallet.generateWalletMnemonic();
        const btcAccountPotentialParent : BIP32Interface = await BtcWallet.getChildFromMnemonic(mnemonic);
        const ionAccountPotentialChild : BIP32Interface = await BtcWallet.getChildFromAccount(btcAccountPotentialParent);        
        const ionJwkPair : JsonWebKey2020 = await IonDid.generateKeyPair(ionAccountPotentialChild);
        const ionServices : IonService[] = [
            {
                id: "tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c",
                type: "hipocrat patient wallet",
                serviceEndpoint: "https://blockstream.info/testnet/address/tb1qsww2x6w2mjmdfv3lcr6gxzxfalykrxxsqprpp7"
            },
            {
                id: "tb1qsww2x6w2mjmdfv3lcr6gxzxfalykrxxsqprpp7",
                type: "hipocrat admin wallet",
                serviceEndpoint: "https://blockstream.info/testnet/address/tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c"
            },
            {
                id: "hipocrat0patient0id",
                type: "hipocrat patient data",
                serviceEndpoint: "https://ipfs.io/ipfs/bafybeialzikkahbkmyjegm5tgus3m4izqntr647pf7uqvhglossdop5fau"
            }
        ]
        const IonDID : IonDidModel = await IonDid.createDid(ionJwkPair, ionServices);

        const ionDidUriShort : string = await IonDid.getDidUriShort(IonDID);
        const ionDidUriLong : string = await IonDid.getDidUriLong(IonDID);

        assert.strictEqual(ionDidUriShort.slice(0,8), 'did:ion:');
        assert.strictEqual(ionDidUriLong.slice(0,8), 'did:ion:');
        assert.strictEqual(ionDidUriShort, ionDidUriLong.slice(0,54));

    })
})

describe('anchor ION DID test', () => {
    it('check anchored Ion DID has same uri intended', async() => {

        const mnemonic : string = await BtcWallet.generateWalletMnemonic();
        const btcAccountPotentialParent : BIP32Interface = await BtcWallet.getChildFromMnemonic(mnemonic);
        const ionAccountPotentialChild : BIP32Interface = await BtcWallet.getChildFromAccount(btcAccountPotentialParent);        
        const ionJwkPair : JsonWebKey2020 = await IonDid.generateKeyPair(ionAccountPotentialChild);
        const ionServices : IonService[] = [
            {
                id: "tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c",
                type: "hipocrat patient wallet",
                serviceEndpoint: "https://blockstream.info/testnet/address/tb1qsww2x6w2mjmdfv3lcr6gxzxfalykrxxsqprpp7"
            },
            {
                id: "tb1qsww2x6w2mjmdfv3lcr6gxzxfalykrxxsqprpp7",
                type: "hipocrat admin wallet",
                serviceEndpoint: "https://blockstream.info/testnet/address/tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c"
            },
            {
                id: "hipocrat0patient0id",
                type: "hipocrat patient data",
                serviceEndpoint: "https://ipfs.io/ipfs/bafybeialzikkahbkmyjegm5tgus3m4izqntr647pf7uqvhglossdop5fau"
            }
        ]
        const IonDID : IonDidModel = await IonDid.createDid(ionJwkPair, ionServices);
        const ionDidUriShort : string = await IonDid.getDidUriShort(IonDID);

        const ionDidAnchored : ionDidResolved = await IonDid.anchorRequest(IonDID);
        
        assert.strictEqual(ionDidAnchored.didDocument.id, ionDidUriShort);

    })
})

describe('get resolved Ion DID test', () => {
    it('anchored did can be found as published(yet to be published can be resolved with long form uri)', async() => {

        const publishedIonDidUriShort : string = "did:ion:EiANB7qQmnIUenccT9ch1A3da8NfmmVGto5-oMKly8ruGQ";
        const ionDidResolved : ionDidResolved  = await IonDid.getDidResolved(publishedIonDidUriShort);

        assert.strictEqual(publishedIonDidUriShort, ionDidResolved.didDocument.id);
        assert.strictEqual(ionDidResolved.didDocumentMetadata.method.published, true);

    })
})


describe('converter test for ION json web key pair->hex key pair', () => {
    it('Json Web Key can be converted to hex format for usage', async() => {

        const mnemonic : string = await BtcWallet.generateWalletMnemonic();
        const btcAccountPotentialParent : BIP32Interface = await BtcWallet.getChildFromMnemonic(mnemonic);
        const ionAccountPotentialChild : BIP32Interface = await BtcWallet.getChildFromAccount(btcAccountPotentialParent);

        const ionJwkPair : JsonWebKey2020 = await IonDid.generateKeyPair(ionAccountPotentialChild);

        const privateKeyHex : string = await IonDid.privateKeyHexFromJwk(ionJwkPair.privateKeyJwk as JsonWebKey);
        const publicKeyHex : string = await IonDid.publicKeyHexFromJwk(ionJwkPair.publicKeyJwk);

        assert.strictEqual(privateKeyHex, ionAccountPotentialChild.privateKey?.toString('hex'));
        assert.strictEqual(publicKeyHex.slice(2, 66), ionAccountPotentialChild.publicKey.toString('hex').slice(2));
    })
})
