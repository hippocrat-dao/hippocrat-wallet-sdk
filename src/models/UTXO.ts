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
	script?: Buffer;
	nonWitnessUtxo?: Buffer;
	witnessUtxo?: {
		script: Buffer;
		value: number;
	};
	isTaproot?: boolean;
	asset?: string | Buffer;
}
