/// <reference types="node" />
export default interface UTXO {
    txid: string | Buffer;
    vout: number;
    status: {
        confirmed: boolean;
        block_height: number;
        block_hash: string | Buffer;
        block_time: number;
    };
    value: number;
    nonWitnessUtxo?: Buffer;
    witnessUtxo?: {
        script: Buffer;
        value: number;
    };
    isTaproot?: boolean;
    redeemScript?: Buffer;
    witnessScript?: Buffer;
    asset?: string | Buffer;
}
