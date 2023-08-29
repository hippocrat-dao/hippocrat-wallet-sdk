import { secp256k1 } from '@noble/curves/secp256k1';
import { CTR } from 'aes-js';
const crypto = globalThis.crypto;

class RareData {
	// ECIES is implemented for data encryption
	static encryptData = async (
		toPubKeyHex: string,
		data: string,
		fromPrivKeyHex?: string,
	): Promise<string> => {
		const fromPrivKey: string | Uint8Array = fromPrivKeyHex
			? fromPrivKeyHex
			: crypto.getRandomValues(new Uint8Array(32));
		const fromPubKey: Uint8Array = secp256k1.getPublicKey(fromPrivKey, true);
		const ecdhKey: Uint8Array = secp256k1.getSharedSecret(
			fromPrivKey,
			toPubKeyHex,
			true,
		);
		// aes-256-ctr is implemented as symmetric key encryption
		const aesCtr = new CTR(ecdhKey.slice(1));
		const encryptedData: Uint8Array = aesCtr.encrypt(
			new TextEncoder().encode(data),
		);

		// convert encryptedData and pubkey to hex string
		const encryptedDataHex: string = await RareData.bytesToHex(encryptedData);
		const fromPubKeyHex: string = await RareData.bytesToHex(fromPubKey);
		return fromPubKeyHex + encryptedDataHex;
	};
	// decrypt encrypted data
	static decryptData = async (
		privKeyHex: string,
		encryptedData: string,
	): Promise<string> => {
		// seperate pubkey and encrypedData
		const encryptedDataArr: Uint8Array = await RareData.hexToBytes(
			encryptedData.slice(66),
		);

		const ecdhKey: Uint8Array = secp256k1.getSharedSecret(
			privKeyHex,
			encryptedData.slice(0, 66),
			true,
		);

		// aes-256-ctr is implemented as symmetric key decryption
		const aesCtr = new CTR(ecdhKey.slice(1));
		const decryptedVault: Uint8Array = aesCtr.decrypt(encryptedDataArr);
		return new TextDecoder().decode(decryptedVault);
	};

	static bytesToHex = async (data: Uint8Array): Promise<string> => {
		return Array.from(data, i => i.toString(16).padStart(2, '0')).join('');
	};

	static hexToBytes = async (data: string): Promise<Uint8Array> => {
		const arr: number[] = [];
		for (let i = 0; i < data.length; i += 2) {
			arr.push(parseInt(data.slice(i, i + 2), 16));
		}
		return Uint8Array.from(arr);
	};

	static sha256 = async (message: string): Promise<string> => {
		const ec = new TextEncoder();
		const data: Uint8Array = ec.encode(message);
		const hashBuffer: ArrayBuffer = await crypto.subtle.digest('SHA-256', data);
		return await this.bytesToHex(new Uint8Array(hashBuffer));
	};
}

export default RareData;
