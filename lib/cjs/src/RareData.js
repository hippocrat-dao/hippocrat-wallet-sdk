"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto-browserify"));
const buffer_1 = require("buffer");
const ALGO = 'aes-256-gcm';
class RareData {
    // ECIES is implemented for data encryption
    static encryptData = async (toPubKeyHex, data, fromPrivKeyHex) => {
        // convert hex key to buffer key
        const toPubKeyBuffer = buffer_1.Buffer.from(toPubKeyHex, 'hex');
        // convert data to buffer
        const fromAlice = await crypto.createECDH('secp256k1');
        let fromPubKey;
        if (fromPrivKeyHex === undefined) {
            fromPubKey = await fromAlice.generateKeys();
        }
        else {
            // convert hex key to buffer key
            const fromPrivKeyBuffer = buffer_1.Buffer.from(fromPrivKeyHex, 'hex');
            fromAlice.setPrivateKey(fromPrivKeyBuffer);
            fromPubKey = fromAlice.getPublicKey();
        }
        const ecdhKey = await fromAlice.computeSecret(toPubKeyBuffer);
        // aes-256-gcm is implemented as symmetric key encryption
        const initializationVector = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGO, ecdhKey, initializationVector);
        const firstChunk = cipher.update(data);
        const secondChunk = cipher.final();
        const tag = cipher.getAuthTag();
        return buffer_1.Buffer
            .concat([firstChunk, secondChunk, tag, initializationVector, fromPubKey])
            .toString('base64');
    };
    // decrypt encrypted data
    static decryptData = async (privKeyHex, encryptedData) => {
        // covert string to buffer for encryptedData
        const encryptedDataShared = buffer_1.Buffer.from(encryptedData, 'base64');
        // convert hex key to buffer key
        const privKeyBuffer = buffer_1.Buffer.from(privKeyHex, 'hex');
        // get fromPubKey and compute ecdh key
        const fromPubKey = buffer_1.Buffer.from(encryptedDataShared.slice(encryptedDataShared.length - 65));
        const toBob = await crypto.createECDH('secp256k1');
        toBob.setPrivateKey(privKeyBuffer);
        const ecdhKey = await toBob.computeSecret(fromPubKey);
        // aes-256-gcm is implemented as symmetric key decryption
        const initializationVector = encryptedDataShared.slice(encryptedDataShared.length - 81, encryptedDataShared.length - 65);
        const tag = encryptedDataShared.slice(encryptedDataShared.length - 97, encryptedDataShared.length - 81);
        const encryptedMessage = encryptedDataShared.slice(0, encryptedDataShared.length - 97);
        const decipher = crypto.createDecipheriv(ALGO, ecdhKey, initializationVector);
        decipher.setAuthTag(tag);
        const firstChunk = decipher.update(encryptedMessage);
        const secondChunk = decipher.final();
        return buffer_1.Buffer.concat([firstChunk, secondChunk]).toString();
    };
}
exports.default = RareData;
