export interface Network {
	wif: number;
	bip32: {
		public: number;
		private: number;
	};
	messagePrefix?: string;
	bech32?: string;
	pubKeyHash?: number;
	scriptHash?: number;
}
export interface Signer {
	publicKey: Buffer;
	lowR: boolean;
	sign(hash: Buffer, lowR?: boolean): Buffer;
	verify(hash: Buffer, signature: Buffer): boolean;
	signSchnorr(hash: Buffer): Buffer;
	verifySchnorr(hash: Buffer, signature: Buffer): boolean;
}
export default interface BtcAccount extends Signer {
	chainCode: Buffer;
	network: Network;
	depth: number;
	index: number;
	parentFingerprint: number;
	privateKey?: Buffer;
	identifier: Buffer;
	fingerprint: Buffer;
	compressed?: boolean;
	isNeutered(): boolean;
	neutered(): BtcAccount;
	toBase58(): string;
	toWIF(): string;
	derive(index: number): BtcAccount;
	deriveHardened(index: number): BtcAccount;
	derivePath(path: string): BtcAccount;
	tweak(t: Buffer): Signer;
}
