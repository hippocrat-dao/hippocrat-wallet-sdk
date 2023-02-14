import fetch from 'cross-fetch';
import UTXO from './models/UTXO';
import BtcRpcUrl from './enums/BtcRpcUrl';

class BtcRpcNode {
    // get single latest utxo of address
    static getUTXOLatest = async (address : string, network : BtcRpcUrl = BtcRpcUrl.Mainnet) 
    : Promise<UTXO> => {
        const path : string = "address/" + address + "/utxo";
        const res = await fetch(
            network + path as string, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
            } as any
        );
        return (await res.json()).at(-1) as UTXO;
    }
    // get utxo list of address
    static getUTXOList = async (address : string, network : BtcRpcUrl = BtcRpcUrl.Mainnet) 
    : Promise<UTXO[]> => {
        const path : string = "address/" + address + "/utxo";
        const res = await fetch(
            network + path as string, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
            } as any
        );
        return (await res.json()) as UTXO[];
    }
    // broadcast transaction to network
    static broadcastTx = async (txHex : string, network : BtcRpcUrl = BtcRpcUrl.Mainnet) 
    : Promise<string> => {
        const path : string = "tx" ;
        const res = await fetch(
            network + path as string, {
                method: "POST",
                body: txHex as string,
                headers: {
                    'Content-Type': 'application/json',
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
            } as any
        );
        return await res.text() as string;
    }
}

export default BtcRpcNode;