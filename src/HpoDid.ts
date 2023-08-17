import HpoDidModel from './models/HpoDidModel.js';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import * as crypto from 'crypto-browserify';

class HpoDid {
	// generate HPO DID from secp256k1 private key
	static create = async (privateKey: string | Buffer): Promise<HpoDidModel> => {
		// get compressed public key from private key
		const alice: crypto.ECDH = await crypto.createECDH('secp256k1');
		alice.setPrivateKey(
			typeof privateKey === 'string'
				? Buffer.from(privateKey, 'hex')
				: privateKey,
		);
		const publicKey: string = alice.getPublicKey().toString('hex');
		const compressedPublicKey: string = publicKey.slice(2, 66);
		// check whether public key's y point is even or odd
		const prefix: string =
			publicKey.at(-1) == '0' ||
			publicKey.at(-1) == '2' ||
			publicKey.at(-1) == '4' ||
			publicKey.at(-1) == '6' ||
			publicKey.at(-1) == '8' ||
			publicKey.at(-1) == 'a' ||
			publicKey.at(-1) == 'c' ||
			publicKey.at(-1) == 'e'
				? '02'
				: '03';
		const publicKeyHex: string = prefix + compressedPublicKey;
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
		privateKey: string | Buffer,
		message = 'hippocrat',
	): Promise<string> => {
		// return signature encoded in base64
		return ecc
			.sign(
				bitcoin.crypto.sha256(Buffer.from(message)),
				typeof privateKey === 'string'
					? Buffer.from(privateKey, 'hex')
					: privateKey,
			)
			.toString('base64');
	};
	// verify with hippocrat DID public key
	static verify = async (
		publicKey: string | Buffer,
		signature: string,
		message = 'hippocrat',
	): Promise<boolean> => {
		return ecc.verify(
			bitcoin.crypto.sha256(Buffer.from(message)),
			typeof publicKey === 'string' ? Buffer.from(publicKey, 'hex') : publicKey,
			Buffer.from(signature, 'base64'),
		);
	};
}

export default HpoDid;
