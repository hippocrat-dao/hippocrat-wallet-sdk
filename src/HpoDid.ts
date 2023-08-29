import HpoDidModel from './models/HpoDidModel.js';
import { secp256k1 } from '@noble/curves/secp256k1';
import RareData from './RareData.js';

class HpoDid {
	// generate HPO DID from secp256k1 private key
	static create = async (privateKey: string): Promise<HpoDidModel> => {
		// get compressed public key from private key
		const publicKeyHex: string = await RareData.bytesToHex(
			secp256k1.getPublicKey(privateKey, true),
		);
		// HpoDid document
		const HpoDidDocument: HpoDidModel = {
			'@context': 'https://www.w3.org/ns/did/v1',
			id: 'did:hpo:' + publicKeyHex,
			verificationMethod: [
				{
					id: 'did:hpo:' + publicKeyHex,
					type: 'EcdsaSecp256k1VerificationKey2019' as const,
					controller: 'did:hpo:' + publicKeyHex,
					publicKeyHex,
				},
			],
		};
		return HpoDidDocument;
	};
	// sign with hippocrat DID private key
	static sign = async (
		privateKey: string,
		message = 'hippocrat',
	): Promise<string> => {
		// return signature encoded in base64
		const signature: any = secp256k1.sign(
			await RareData.sha256(message),
			privateKey,
		);
		return signature.toCompactHex();
	};
	// verify with hippocrat DID public key
	static verify = async (
		publicKey: string,
		signature: string,
		message = 'hippocrat',
	): Promise<boolean> => {
		return secp256k1.verify(
			signature,
			await RareData.sha256(message),
			publicKey,
		);
	};
}

export default HpoDid;
