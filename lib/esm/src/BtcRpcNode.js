import fetch from 'cross-fetch';
import BtcRpcUrl from './enums/BtcRpcUrl.js';
class BtcRpcNode {
    // get single latest utxo of address
    static getUTXOLatest = async (address, network = BtcRpcUrl.Mainnet) => {
        const path = "address/" + address + "/utxo";
        const res = await fetch(network + path, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return (await res.json()).at(-1);
    };
    // get utxo list of address
    static getUTXOList = async (address, network = BtcRpcUrl.Mainnet) => {
        const path = "address/" + address + "/utxo";
        const res = await fetch(network + path, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return (await res.json());
    };
    // broadcast transaction to network
    static broadcastTx = async (txHex, network = BtcRpcUrl.Mainnet) => {
        const path = "tx";
        const res = await fetch(network + path, {
            method: "POST",
            body: txHex,
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return await res.text();
    };
}
export default BtcRpcNode;
