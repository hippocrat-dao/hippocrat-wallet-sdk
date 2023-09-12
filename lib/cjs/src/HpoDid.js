"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const secp256k1_1 = require("@noble/curves/secp256k1");
const RareData_js_1 = __importDefault(require("./RareData.js"));
class HpoDid {
    // generate HPO DID from secp256k1 private key
    static create = async (privateKey) => {
        // get compressed public key from private key
        const publicKeyHex = await RareData_js_1.default.bytesToHex(secp256k1_1.secp256k1.getPublicKey(privateKey, true));
        // HpoDid document
        const HpoDidDocument = {
            '@context': 'https://www.w3.org/ns/did/v1',
            id: 'did:hpo:' + publicKeyHex,
            verificationMethod: [
                {
                    id: 'did:hpo:' + publicKeyHex,
                    type: 'EcdsaSecp256k1VerificationKey2019',
                    controller: 'did:hpo:' + publicKeyHex,
                    publicKeyHex,
                },
            ],
        };
        return HpoDidDocument;
    };
    // sign with hippocrat DID private key
    static sign = async (privateKey, message = 'hippocrat') => {
        // return signature encoded in base64
        const signature = secp256k1_1.secp256k1.sign(await RareData_js_1.default.sha256(message), privateKey);
        return signature.toCompactHex();
    };
    // verify with hippocrat DID public key
    static verify = async (publicKey, signature, message = 'hippocrat') => {
        return secp256k1_1.secp256k1.verify(signature, await RareData_js_1.default.sha256(message), publicKey);
    };
}
exports.default = HpoDid;
