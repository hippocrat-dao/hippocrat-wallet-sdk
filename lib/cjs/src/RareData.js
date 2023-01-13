"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eccrypto_1 = __importDefault(require("eccrypto"));
const crypto_1 = __importDefault(require("crypto"));
const ALGO = 'aes-256-gcm';
class RareData {
    // ECIES is implemented for data encryption
    static encryptData = async (publicKeyHexTo, data) => {
        // convert hex key to buffer key
        const publicKeyBuffer = Buffer.from(publicKeyHexTo, 'hex');
        // convert data to buffer
        const msg = Buffer.from(data);
        const encryptedData = await eccrypto_1.default.encrypt(publicKeyBuffer, msg);
        return JSON.stringify(encryptedData);
    };
    // decrypt encrypted data
    static decryptData = async (privateKeyHex, encryptedData) => {
        const encryptedDataECIES = JSON.parse(encryptedData, (k, v) => {
            if (v.type === "Buffer")
                return Buffer.from(v.data);
            return v;
        });
        // convert hex key to buffer key
        const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');
        const decryptedData = await eccrypto_1.default.decrypt(privateKeyBuffer, encryptedDataECIES);
        return decryptedData.toString();
    };
    // encrypt data with cipher's fixed private key
    static encryptDataShared = async (privateKeyHexA, publicKeyHexB, data) => {
        const sharedKey = await eccrypto_1.default.derive(Buffer.from(privateKeyHexA, 'hex'), Buffer.from(publicKeyHexB, 'hex'));
        // aes-256-gcm is implemented as symmetric key encryption
        const initializationVector = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv(ALGO, sharedKey, initializationVector);
        const firstChunk = cipher.update(data);
        const secondChunk = cipher.final();
        const tag = cipher.getAuthTag();
        return Buffer
            .concat([firstChunk, secondChunk, tag, initializationVector])
            .toString('base64');
    };
    // decrypt data with cipher's fixed public key
    static decryptDataShared = async (privateKeyHexB, publicKeyHexA, encryptedDataSharedStr) => {
        const encryptedDataShared = Buffer.from(encryptedDataSharedStr, 'base64');
        const sharedKey = await eccrypto_1.default.derive(Buffer.from(privateKeyHexB, 'hex'), Buffer.from(publicKeyHexA, 'hex'));
        // aes-256-gcm is implemented as symmetric key decryption
        const initializationVector = encryptedDataShared.slice(encryptedDataShared.length - 16);
        const tag = encryptedDataShared.slice(encryptedDataShared.length - 32, encryptedDataShared.length - 16);
        const encryptedData = encryptedDataShared.slice(0, encryptedDataShared.length - 32);
        const decipher = crypto_1.default.createDecipheriv(ALGO, sharedKey, initializationVector);
        decipher.setAuthTag(tag);
        const firstChunk = decipher.update(encryptedData);
        const secondChunk = decipher.final();
        return Buffer.concat([firstChunk, secondChunk]).toString();
    };
}
exports.default = RareData;
