import request from 'request';
// later in env
const rpcNodeUrlTest : string = "https://blockstream.info/testnet/api/"

class BtcRpcNode {
    // get single latest utxo of address
    static getUTXOLatest = async (address : string) 
    : Promise<JSON> => {
        const path : string = "address/" + address + "/utxo";
        return new Promise<JSON>((resolve, reject) => request({
            url: rpcNodeUrlTest + path as string,
            method: 'GET' as string,
            forever: true as boolean
            },
            (err : any, res : request.Response) => {
                err? 
                reject(err) as void : 
                resolve(
                    JSON.parse(res.body as string)[0] as JSON
                    ) as void;
            }))
    }
    // get utxo list of address
    static getUTXOList = async (address : string) 
    : Promise<JSON> => {
        const path : string = "address/" + address + "/utxo";
        return new Promise<JSON>((resolve, reject) => request({
            url: rpcNodeUrlTest + path as string,
            method: 'GET' as string,
            forever: true as boolean
            },
            (err : any, res : request.Response) => {
                err? 
                reject(err) as void : 
                resolve(
                    JSON.parse(res.body as string) as JSON
                    ) as void;
            }))
    }
    // broadcast transaction to network
    static broadcastTx = async (txHex : string) 
    : Promise<string> => {
        const path : string = "tx" ;
        return new Promise<string>((resolve, reject) => request({
            url: rpcNodeUrlTest + path as string,
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