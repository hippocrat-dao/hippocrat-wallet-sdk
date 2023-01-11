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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const esmLoader = async () => {
    const ION = await import("@decentralized-identity/ion-tools");
    const base64_1 = await import("multiformats/bases/base64");
    return {ION, base64_1};
};
const Secp256k1 = __importStar(require("@noble/secp256k1"));
const keyto_1 = __importDefault(require("@trust/keyto"));
class IonDid {
    // generateKeyPair with key of btcAccount
    static generateKeyPair = async (ionAccountPotential) => {
        const {ION, base64_1} = await esmLoader();
        const privateKeyBytes = ionAccountPotential.privateKey;
        const publicKeyBytes = await Secp256k1.getPublicKey(privateKeyBytes);
        const d = base64_1.base64url.baseEncode(privateKeyBytes);
        // skip the first byte because it's used as a header to indicate whether the key is uncompressed
        const x = base64_1.base64url.baseEncode(publicKeyBytes.subarray(1, 33));
        const y = base64_1.base64url.baseEncode(publicKeyBytes.subarray(33, 65));
        const publicJwk = {
            // alg: 'ES256K',
            kty: 'EC',
            crv: 'secp256k1',
            x,
            y
        };
        const privateJwk = { ...publicJwk, d };
        return { publicJwk, privateJwk };
    };
    // generate did with public key
    static createDid = async (ionKeyPair, ionServices) => {
        const ionDid = {
            operation: 'create',
            content: {
                // Register the public key for authentication(private key belongs to user)
                publicKeys: [
                    {
                        id: 'auth-key',
                        type: 'EcdsaSecp256k1VerificationKey2019',
                        publicKeyJwk: ionKeyPair.publicJwk,
                        purposes: ['authentication']
                    }
                ],
                // Register an IdentityHub as a service
                services: ionServices
            },
            recovery: ionKeyPair,
            update: ionKeyPair
        };
        return ionDid;
    };
    // did short uri by instance(only resolvable after did published to ION network)
    static getDidUriShort = async (did) => {
        const didForOps = await this._getDidOpsFromModel(did);
        const shortFormUri = await didForOps.getURI("short");
        return shortFormUri;
    };
    // did long uri by instance(able to use instantly without anchoring)
    static getDidUriLong = async (did) => {
        const didForOps = await this._getDidOpsFromModel(did);
        const longFormUri = await didForOps.getURI();
        return longFormUri;
    };
    // submit ion did on bitcoin chain -> default node is run by Microsoft
    static anchorDidOnChain = async (did) => {
        const {ION, base64_1} = await esmLoader();
        const didForOps = await this._getDidOpsFromModel(did);
        const anchorRequest = await didForOps.generateRequest();
        const anchorResponse = await ION.anchor(anchorRequest);
        return JSON.parse(anchorResponse);
    };
    // resolve published did if uri in short, unpublished one it in long
    static getDidResolved = async (didUri) => {
        const {ION, base64_1} = await esmLoader();
        const didResolved = await ION.resolve(didUri);
        return didResolved;
    };
    // sign message with ion did(kind of auth)
    static signMessage = async (msg, ionPrivateJwk) => {
        const {ION, base64_1} = await esmLoader();
        return await ION.sign({ payload: msg, privateJwk: ionPrivateJwk });
    };
    // verify message from json web signature signed by ion did
    static verifyMessage = async (signedMsg, ionPublicJwk) => {
        const {ION, base64_1} = await esmLoader();
        return await ION.verify({ jws: signedMsg, publicJwk: ionPublicJwk });
    };
    // convert privateJwk to hex
    static privateKeyHexFromJwk = async (privateJwk) => {
        return keyto_1.default
            .from({
            ...privateJwk,
            crv: 'K-256',
        }, 'jwk')
            .toString('blk', 'private');
    };
    // convert publicJwk to hex
    static publicKeyHexFromJwk = async (publicJwk) => {
        return keyto_1.default
            .from({
            ...publicJwk,
            crv: 'K-256',
        }, 'jwk')
            .toString('blk', 'public');
    };
    static _getDidOpsFromModel = async (did) => {
        const {ION, base64_1} = await esmLoader();
        const didForOps = new ION.DID({ ops: [did] });
        return didForOps;
    };
}
exports.default = IonDid;