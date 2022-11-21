interface Network {
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
interface Signer {
    publicKey: Buffer;
    lowR: boolean;
    sign(hash: Buffer, lowR?: boolean): Buffer;
    verify(hash: Buffer, signature: Buffer): boolean;
    signSchnorr(hash: Buffer): Buffer;
    verifySchnorr(hash: Buffer, signature: Buffer): boolean;
}
export default interface BIP32Interface extends Signer {
    chainCode: Buffer;
    network: Network;
    depth: number;
    index: number;
    parentFingerprint: number;
    privateKey?: Buffer;
    identifier: Buffer;
    fingerprint: Buffer;
    isNeutered(): boolean;
    neutered(): BIP32Interface;
    toBase58(): string;
    toWIF(): string;
    derive(index: number): BIP32Interface;
    deriveHardened(index: number): BIP32Interface;
    derivePath(path: string): BIP32Interface;
    tweak(t: Buffer): Signer;
}