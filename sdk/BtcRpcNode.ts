import request from 'request';
import UTXO from './models/UTXO';
import BtcRpcUrl from './enums/BtcRpcUrl.js';

//const network = BtcRpcUrl.Testnet;

class BtcRpcNode {
    // get single latest utxo of address
    static getUTXOLatest = async (address : string, network : BtcRpcUrl) 
    : Promise<UTXO> => {
        const path : string = "address/" + address + "/utxo";
        return new Promise<UTXO>((resolve, reject) => request({
            url: network + path as string,
            method: 'GET' as string,
            forever: true as boolean
            },
            (err : any, res : request.Response) => {
                err? 
                reject(err) as void : 
                resolve(
                    JSON.parse(res.body as string).at(-1) as UTXO
                    ) as void;
            }))
    }
    // get utxo list of address
    static getUTXOList = async (address : string, network : BtcRpcUrl) 
    : Promise<UTXO[]> => {
        const path : string = "address/" + address + "/utxo";
        return new Promise<UTXO[]>((resolve, reject) => request({
            url: network + path as string,
            method: 'GET' as string,
            forever: true as boolean
            },
            (err : any, res : request.Response) => {
                err? 
                reject(err) as void : 
                resolve(
                    JSON.parse(res.body as string) as UTXO[]
                    ) as void;
            }))
    }
    // broadcast transaction to network
    static broadcastTx = async (txHex : string, network : BtcRpcUrl) 
    : Promise<string> => {
        const path : string = "tx" ;
        return new Promise<string>((resolve, reject) => request({
            url: network + path as string,
            method: 'POST' as string,
            body : txHex as string,
            forever: true as boolean
            },
            (err : any, res : request.Response) => {
                err? 
                reject(err) as void : 
                resolve(res.body as string) as void;
            }))   
    }
}

export default BtcRpcNode;