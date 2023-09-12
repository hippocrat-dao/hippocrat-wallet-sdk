"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const BtcRpcUrl_js_1 = __importDefault(require("./enums/BtcRpcUrl.js"));
class BtcRpcNode {
    // get single latest utxo of address
    static getUTXOLatest = async (address, network = BtcRpcUrl_js_1.default.Mainnet) => {
        const path = 'address/' + address + '/utxo';
        const res = await (0, cross_fetch_1.default)((network + path), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return (await res.json()).at(-1);
    };
    // get utxo list of address
    static getUTXOList = async (address, network = BtcRpcUrl_js_1.default.Mainnet) => {
        const path = 'address/' + address + '/utxo';
        const res = await (0, cross_fetch_1.default)((network + path), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return (await res.json());
    };
    // broadcast transaction to network
    static broadcastTx = async (txHex, network = BtcRpcUrl_js_1.default.Mainnet) => {
        const path = 'tx';
        const res = await (0, cross_fetch_1.default)((network + path), {
            method: 'POST',
            body: txHex,
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return (await res.text());
    };
}
exports.default = BtcRpcNode;
