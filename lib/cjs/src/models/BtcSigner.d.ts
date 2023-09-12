/// <reference types="node" />
import { Network } from './BtcAccount.js';
import BtcAccount from './BtcAccount.js';
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
export default interface BtcSigner {
    payment: Payment;
    keyPair: BtcAccount;
    addressNext: string;
}
export {};
