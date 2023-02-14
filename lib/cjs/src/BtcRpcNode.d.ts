import UTXO from './models/UTXO';
import BtcRpcUrl from './enums/BtcRpcUrl';
declare class BtcRpcNode {
    static getUTXOLatest: (address: string, network?: BtcRpcUrl) => Promise<UTXO>;
    static getUTXOList: (address: string, network?: BtcRpcUrl) => Promise<UTXO[]>;
    static broadcastTx: (txHex: string, network?: BtcRpcUrl) => Promise<string>;
}
export default BtcRpcNode;
