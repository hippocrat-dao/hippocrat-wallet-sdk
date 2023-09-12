import UTXO from './models/UTXO.js';
import BtcRpcUrl from './enums/BtcRpcUrl.js';
declare class BtcRpcNode {
    static getUTXOLatest: (address: string, network?: BtcRpcUrl) => Promise<UTXO>;
    static getUTXOList: (address: string, network?: BtcRpcUrl) => Promise<UTXO[]>;
    static broadcastTx: (txHex: string, network?: BtcRpcUrl) => Promise<string>;
}
export default BtcRpcNode;
