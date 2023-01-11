/// <reference types="node" />
import { Network, Signer } from './BtcAccount';
interface Payment {
    name?: string;
    network?: Network;
    output?: Buffer;
    data?: Buffer[];
    m?: number;
    n?: number;
    pubkeys?: Buffer[];
    input?: Buffer;
    signatures?: Buffer[];
    pubkey?: Buffer;
    signature?: Buffer;
    address?: string;
    hash?: Buffer;
    redeem?: Payment;
    witness?: Buffer[];
}
interface ECPairInterface extends Signer {
    compressed: boolean;
    network: Network;
    lowR: boolean;
    privateKey?: Buffer;
    toWIF(): string;
    tweak(t: Buffer): ECPairInterface;
    verify(hash: Buffer, signature: Buffer): boolean;
    verifySchnorr(hash: Buffer, signature: Buffer): boolean;
    signSchnorr(hash: Buffer): Buffer;
}
export default interface BtcSigner {
    payment: Payment;
    keyPair: ECPairInterface;
    addressNext: string;
}
export {};
