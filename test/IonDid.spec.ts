import * as assert from "assert";
import { describe, it } from 'mocha';
import * as hippocrat from '../index.js'

describe('generate ION key pair test', () => {
    it('Ion Key based on secp256k1 can be derived from HD wallet(bip39) mnemonic', async() => {
        // Given
        const mnemonic : string = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotentialParent : hippocrat.BtcAccount = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const ionAccountPotentialChild : hippocrat.BtcAccount = await hippocrat.BtcWallet.getChildFromAccount(btcAccountPotentialParent);
        // When
        const ionJwkPair : hippocrat.JsonWebKey2020 = await hippocrat.IonDid.generateKeyPair(ionAccountPotentialChild);
        // Then
        assert.strictEqual(ionJwkPair.id.slice(0,8), "did:key:");
        assert.strictEqual(ionJwkPair.type, "JsonWebKey2020");
        assert.strictEqual(ionJwkPair.controller.slice(0,8), "did:key:");
        assert.strictEqual((ionJwkPair.privateKeyJwk as JsonWebKey).crv, "secp256k1");
        assert.strictEqual(ionJwkPair.publicKeyJwk.crv, "secp256k1");
    })
})

describe('create ION DID test', () => {
    it('check Ion DID format', async() => {
        // Given
        const mnemonic : string = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotentialParent : hippocrat.BtcAccount = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const ionAccountPotentialChild : hippocrat.BtcAccount = await hippocrat.BtcWallet.getChildFromAccount(btcAccountPotentialParent);
        const ionJwkPair : hippocrat.JsonWebKey2020 = await hippocrat.IonDid.generateKeyPair(ionAccountPotentialChild);
        const ionServices : hippocrat.IonService[] = [
            {
                id: "tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c",
                type: "hippocrat patient wallet",
                serviceEndpoint: "https://blockstream.info/testnet/address/tb1qsww2x6w2mjmdfv3lcr6gxzxfalykrxxsqprpp7"
            },
            {
                id: "tb1qsww2x6w2mjmdfv3lcr6gxzxfalykrxxsqprpp7",
                type: "hippocrat admin wallet",
                serviceEndpoint: "https://blockstream.info/testnet/address/tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c"
            },
            {
                id: "hippocrat0patient0id",
                type: "hippocrat patient data",
                serviceEndpoint: "https://ipfs.io/ipfs/bafybeialzikkahbkmyjegm5tgus3m4izqntr647pf7uqvhglossdop5fau"
            }
        ]
        // When
        const IonDID : hippocrat.IonDidModel = await hippocrat.IonDid.createDid(ionJwkPair, ionServices);
        // Then
        assert.strictEqual(IonDID.operation, 'create');
        assert.strictEqual(IonDID.content.publicKeys[0].publicKeyJwk, ionJwkPair.publicKeyJwk);
        assert.strictEqual(IonDID.content.services, ionServices);

    })
})

describe('get ION DID uri(long & short) test', () => {
    it('check ion did uri in right format', async() => {
        // Given
        const mnemonic : string = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotentialParent : hippocrat.BtcAccount = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const ionAccountPotentialChild : hippocrat.BtcAccount = await hippocrat.BtcWallet.getChildFromAccount(btcAccountPotentialParent);        
        const ionJwkPair : hippocrat.JsonWebKey2020 = await hippocrat.IonDid.generateKeyPair(ionAccountPotentialChild);
        const ionServices : hippocrat.IonService[] = [
            {
                id: "tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c",
                type: "hippocrat patient wallet",
                serviceEndpoint: "https://blockstream.info/testnet/address/tb1qsww2x6w2mjmdfv3lcr6gxzxfalykrxxsqprpp7"
            },
            {
                id: "tb1qsww2x6w2mjmdfv3lcr6gxzxfalykrxxsqprpp7",
                type: "hippocrat admin wallet",
                serviceEndpoint: "https://blockstream.info/testnet/address/tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c"
            },
            {
                id: "hippocrat0patient0id",
                type: "hippocrat patient data",
                serviceEndpoint: "https://ipfs.io/ipfs/bafybeialzikkahbkmyjegm5tgus3m4izqntr647pf7uqvhglossdop5fau"
            }
        ]
        const IonDID : hippocrat.IonDidModel = await hippocrat.IonDid.createDid(ionJwkPair, ionServices);
        // When
        const ionDidUriShort : string = await hippocrat.IonDid.getDidUriShort(IonDID);
        const ionDidUriLong : string = await hippocrat.IonDid.getDidUriLong(IonDID);
        // Then
        assert.strictEqual(ionDidUriShort.slice(0,8), 'did:ion:');
        assert.strictEqual(ionDidUriLong.slice(0,8), 'did:ion:');
        assert.strictEqual(ionDidUriShort, ionDidUriLong.slice(0,54));

    })
})

describe('anchor ION DID test', () => {
    it('check anchored Ion DID has same uri intended', async() => {
        // Given
        const mnemonic : string = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotentialParent : hippocrat.BtcAccount = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const ionAccountPotentialChild : hippocrat.BtcAccount = await hippocrat.BtcWallet.getChildFromAccount(btcAccountPotentialParent);        
        const ionJwkPair : hippocrat.JsonWebKey2020 = await hippocrat.IonDid.generateKeyPair(ionAccountPotentialChild);
        const ionServices : hippocrat.IonService[] = [
            {
                id: "tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c",
                type: "hippocrat patient wallet",
                serviceEndpoint: "https://blockstream.info/testnet/address/tb1qsww2x6w2mjmdfv3lcr6gxzxfalykrxxsqprpp7"
            },
            {
                id: "tb1qsww2x6w2mjmdfv3lcr6gxzxfalykrxxsqprpp7",
                type: "hippocrat admin wallet",
                serviceEndpoint: "https://blockstream.info/testnet/address/tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c"
            },
            {
                id: "hippocrat0patient0id",
                type: "hippocrat patient data",
                serviceEndpoint: "https://ipfs.io/ipfs/bafybeialzikkahbkmyjegm5tgus3m4izqntr647pf7uqvhglossdop5fau"
            }
        ]
        const IonDID : hippocrat.IonDidModel = await hippocrat.IonDid.createDid(ionJwkPair, ionServices);
        const ionDidUriShort : string = await hippocrat.IonDid.getDidUriShort(IonDID);
        // When
        const ionDidAnchored : hippocrat.IonDidResolved = await hippocrat.IonDid.anchorRequest(IonDID);
        // Then
        assert.strictEqual(ionDidAnchored.didDocument.id, ionDidUriShort);

    })
})

describe('get resolved Ion DID test', () => {
    it('anchored did can be found as published(yet to be published can be resolved with long form uri)', async() => {
        // Given
        const publishedIonDidUriShort : string = "did:ion:EiANB7qQmnIUenccT9ch1A3da8NfmmVGto5-oMKly8ruGQ";
        // When
        const ionDidResolved : hippocrat.IonDidResolved  = await hippocrat.IonDid.getDidResolved(publishedIonDidUriShort);
        // Then
        assert.strictEqual(publishedIonDidUriShort, ionDidResolved.didDocument.id);
        assert.strictEqual(ionDidResolved.didDocumentMetadata.method.published, true);

    })
})


describe('converter test for ION json web key pair->hex key pair', () => {
    it('Json Web Key can be converted to hex format for usage', async() => {
        // Given
        const mnemonic : string = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotentialParent : hippocrat.BtcAccount = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const ionAccountPotentialChild : hippocrat.BtcAccount = await hippocrat.BtcWallet.getChildFromAccount(btcAccountPotentialParent);
        const ionJwkPair : hippocrat.JsonWebKey2020 = await hippocrat.IonDid.generateKeyPair(ionAccountPotentialChild);
        // When
        const privateKeyHex : string = await hippocrat.IonDid.privateKeyHexFromJwk(ionJwkPair.privateKeyJwk as JsonWebKey);
        const publicKeyHex : string = await hippocrat.IonDid.publicKeyHexFromJwk(ionJwkPair.publicKeyJwk);
        // Then
        assert.strictEqual(privateKeyHex, ionAccountPotentialChild.privateKey?.toString('hex'));
        assert.strictEqual(publicKeyHex.slice(2, 66), ionAccountPotentialChild.publicKey.toString('hex').slice(2));
    })
})
