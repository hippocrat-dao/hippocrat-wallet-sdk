"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BtcWallet_1 = __importDefault(require("./BtcWallet"));
class HpoDid {
    // derive HPO DID account from BTC HD wallet mnemonic
    static createDid = async (mnemonic, purpose = 0, index = 0) => {
        // HpoDid to generate document
        const HpoDid = await BtcWallet_1.default.getNonBtcAccountFromMnemonic(mnemonic, purpose, index);
        // HpoDid document
        const HpoDidDocument = {
            '@context': 'https://www.w3.org/ns/did/v1',
            'id': 'did:hpo:' + HpoDid.publicKey.toString('hex'),
            'verificationMethod': [
                {
                    'id': 'did:hpo:' + HpoDid.publicKey.toString('hex'),
                    'type': 'EcdsaSecp256k1VerificationKey2019',
                    'controller': 'did:hpo:' + HpoDid.publicKey.toString('hex'),
                    'publicKeyHex': HpoDid.publicKey.toString('hex')
                }
            ]
        };
        return HpoDidDocument;
    };
}
exports.default = HpoDid;
