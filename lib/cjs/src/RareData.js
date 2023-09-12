"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const secp256k1_1 = require("@noble/curves/secp256k1");
const aes_js_1 = require("aes-js");
const crypto = globalThis.crypto;
class RareData {
    // ECIES is implemented for data encryption
    static encryptData = async (toPubKeyHex, data, fromPrivKeyHex) => {
        const fromPrivKey = fromPrivKeyHex
            ? fromPrivKeyHex
            : crypto.getRandomValues(new Uint8Array(32));
        const fromPubKey = secp256k1_1.secp256k1.getPublicKey(fromPrivKey, true);
        const ecdhKey = secp256k1_1.secp256k1.getSharedSecret(fromPrivKey, toPubKeyHex, true);
        // aes-256-ctr is implemented as symmetric key encryption
        const aesCtr = new aes_js_1.CTR(ecdhKey.slice(1));
        const encryptedData = aesCtr.encrypt(new TextEncoder().encode(data));
        // convert encryptedData and pubkey to hex string
        const encryptedDataHex = await RareData.bytesToHex(encryptedData);
        const fromPubKeyHex = await RareData.bytesToHex(fromPubKey);
        return fromPubKeyHex + encryptedDataHex;
    };
    // decrypt encrypted data
    static decryptData = async (privKeyHex, encryptedData) => {
        // seperate pubkey and encrypedData
        const encryptedDataArr = await RareData.hexToBytes(encryptedData.slice(66));
        const ecdhKey = secp256k1_1.secp256k1.getSharedSecret(privKeyHex, encryptedData.slice(0, 66), true);
        // aes-256-ctr is implemented as symmetric key decryption
        const aesCtr = new aes_js_1.CTR(ecdhKey.slice(1));
        const decryptedVault = aesCtr.decrypt(encryptedDataArr);
        return new TextDecoder().decode(decryptedVault);
    };
    static bytesToHex = async (data) => {
        return Array.from(data, i => i.toString(16).padStart(2, '0')).join('');
    };
    static hexToBytes = async (data) => {
        const arr = [];
        for (let i = 0; i < data.length; i += 2) {
            arr.push(parseInt(data.slice(i, i + 2), 16));
        }
        return Uint8Array.from(arr);
    };
    static sha256 = async (message) => {
        const ec = new TextEncoder();
        const data = ec.encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return await this.bytesToHex(new Uint8Array(hashBuffer));
    };
}
exports.default = RareData;
