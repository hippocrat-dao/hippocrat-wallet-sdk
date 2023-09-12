import { secp256k1 } from '@noble/curves/secp256k1';
import RareData from './RareData.js';
class HpoDid {
    // generate HPO DID from secp256k1 private key
    static create = async (privateKey) => {
        // get compressed public key from private key
        const publicKeyHex = await RareData.bytesToHex(secp256k1.getPublicKey(privateKey, true));
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
        const signature = secp256k1.sign(await RareData.sha256(message), privateKey);
        return signature.toCompactHex();
    };
    // verify with hippocrat DID public key
    static verify = async (publicKey, signature, message = 'hippocrat') => {
        return secp256k1.verify(signature, await RareData.sha256(message), publicKey);
    };
}
export default HpoDid;
