"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const mocha_1 = require("mocha");
const hippocrat = __importStar(require("../index.js"));
(0, mocha_1.describe)('generate ION key pair test', () => {
    (0, mocha_1.it)('Ion Key based on secp256k1 can be derived from HD wallet(bip39) mnemonic', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotentialParent = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const ionAccountPotentialChild = await hippocrat.BtcWallet.getChildFromAccount(btcAccountPotentialParent);
        // When
        const ionJwkPair = await hippocrat.IonDid.generateKeyPair(ionAccountPotentialChild);
        // Then
        assert.strictEqual(ionJwkPair.privateJwk.crv, "secp256k1");
        assert.strictEqual(ionJwkPair.publicJwk.crv, "secp256k1");
    });
});
(0, mocha_1.describe)('create ION DID test', () => {
    (0, mocha_1.it)('check Ion DID format', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotentialParent = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const ionAccountPotentialChild = await hippocrat.BtcWallet.getChildFromAccount(btcAccountPotentialParent);
        const ionJwkPair = await hippocrat.IonDid.generateKeyPair(ionAccountPotentialChild);
        const ionServices = [
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
        ];
        // When
        const IonDID = await hippocrat.IonDid.createDid(ionJwkPair, ionServices);
        // Then
        assert.strictEqual(IonDID.operation, 'create');
        assert.strictEqual(IonDID.content.publicKeys[0].publicKeyJwk, ionJwkPair.publicJwk);
        assert.strictEqual(IonDID.content.services, ionServices);
    });
});
(0, mocha_1.describe)('get ION DID uri(long & short) test', () => {
    (0, mocha_1.it)('check ion did uri in right format', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotentialParent = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const ionAccountPotentialChild = await hippocrat.BtcWallet.getChildFromAccount(btcAccountPotentialParent);
        const ionJwkPair = await hippocrat.IonDid.generateKeyPair(ionAccountPotentialChild);
        const ionServices = [
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
        ];
        const IonDID = await hippocrat.IonDid.createDid(ionJwkPair, ionServices);
        // When
        const ionDidUriShort = await hippocrat.IonDid.getDidUriShort(IonDID);
        const ionDidUriLong = await hippocrat.IonDid.getDidUriLong(IonDID);
        // Then
        assert.strictEqual(ionDidUriShort.slice(0, 8), 'did:ion:');
        assert.strictEqual(ionDidUriLong.slice(0, 8), 'did:ion:');
        assert.strictEqual(ionDidUriShort, ionDidUriLong.slice(0, 54));
    });
});
(0, mocha_1.describe)('anchor ION DID test', () => {
    (0, mocha_1.it)('check anchored Ion DID has same uri intended', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotentialParent = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const ionAccountPotentialChild = await hippocrat.BtcWallet.getChildFromAccount(btcAccountPotentialParent);
        const ionJwkPair = await hippocrat.IonDid.generateKeyPair(ionAccountPotentialChild);
        const ionServices = [
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
        ];
        const IonDID = await hippocrat.IonDid.createDid(ionJwkPair, ionServices);
        const ionDidUriShort = await hippocrat.IonDid.getDidUriShort(IonDID);
        // When
        const ionDidAnchored = await hippocrat.IonDid.anchorRequest(IonDID);
        // Then
        assert.strictEqual(ionDidAnchored.didDocument.id, ionDidUriShort);
    });
});
(0, mocha_1.describe)('get resolved Ion DID test', () => {
    (0, mocha_1.it)('anchored did can be found as published(yet to be published can be resolved with long form uri)', async () => {
        // Given
        const publishedIonDidUriShort = "did:ion:EiANB7qQmnIUenccT9ch1A3da8NfmmVGto5-oMKly8ruGQ";
        // When
        const ionDidResolved = await hippocrat.IonDid.getDidResolved(publishedIonDidUriShort);
        // Then
        assert.strictEqual(publishedIonDidUriShort, ionDidResolved.didDocument.id);
        assert.strictEqual(ionDidResolved.didDocumentMetadata.method.published, true);
    });
});
(0, mocha_1.describe)('converter test for ION json web key pair->hex key pair', () => {
    (0, mocha_1.it)('Json Web Key can be converted to hex format for usage', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotentialParent = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const ionAccountPotentialChild = await hippocrat.BtcWallet.getChildFromAccount(btcAccountPotentialParent);
        const ionJwkPair = await hippocrat.IonDid.generateKeyPair(ionAccountPotentialChild);
        // When
        const privateKeyHex = await hippocrat.IonDid.privateKeyHexFromJwk(ionJwkPair.privateJwk);
        const publicKeyHex = await hippocrat.IonDid.publicKeyHexFromJwk(ionJwkPair.publicJwk);
        // Then
        assert.strictEqual(privateKeyHex, ionAccountPotentialChild.privateKey?.toString('hex'));
        assert.strictEqual(publicKeyHex.slice(2, 66), ionAccountPotentialChild.publicKey.toString('hex').slice(2));
    });
});
(0, mocha_1.describe)('ION DID sign & verify test', () => {
    (0, mocha_1.it)('Json Web Signature can be generated and veirfied by ION DID', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotentialParent = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const ionAccountPotentialChild = await hippocrat.BtcWallet.getChildFromAccount(btcAccountPotentialParent);
        const ionJwkPair = await hippocrat.IonDid.generateKeyPair(ionAccountPotentialChild);
        const msg = "I am the owner of this ION DID";
        // When
        const ionJWS = await hippocrat.IonDid.signMessage(msg, ionJwkPair.privateJwk);
        const isJWSValid = await hippocrat.IonDid.verifyMessage(ionJWS, ionJwkPair.publicJwk);
        // Then
        assert.strictEqual(isJWSValid, true);
    });
});
