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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bip39 = __importStar(require("bip39"));
const bitcoin = __importStar(require("bitcoinjs-lib"));
const secp256k1_1 = __importDefault(require("@bitcoinerlab/secp256k1"));
const bip32 = __importStar(require("bip32"));
const scrypt_js_1 = __importDefault(require("scrypt-js"));
const BtcNetwork_js_1 = __importDefault(require("./enums/BtcNetwork.js"));
const MnemonicLang_js_1 = __importDefault(require("./enums/MnemonicLang.js"));
const aes_js_1 = require("aes-js");
const RareData_js_1 = __importDefault(require("./RareData.js"));
const crypto = globalThis.crypto;
class BtcWallet {
    // HD wallet will be for both ion and bitcoin
    static generateWalletMnemonic = async (language = MnemonicLang_js_1.default.ENGLISH) => {
        // random mnemonic 12 words generated
        bip39.setDefaultWordlist(language);
        const mnemonic = bip39.generateMnemonic();
        return mnemonic;
    };
    // Mnemonic valid for bip39 wallet?
    static isMnemonicValid = async (mnemonic, language = MnemonicLang_js_1.default.ENGLISH) => {
        bip39.setDefaultWordlist(language);
        return bip39.validateMnemonic(mnemonic);
    };
    // derive child account from BTC HD wallet
    static getAccountFromMnemonic = async (mnemonic, index = 0) => {
        const seed = await bip39.mnemonicToSeed(mnemonic);
        // hd wallet(master wallet)
        const root = bip32
            .BIP32Factory(secp256k1_1.default)
            .fromSeed(seed);
        // derived child account from hd(to manage BTC)
        const child = root
            .deriveHardened(84) // purpose
            .deriveHardened(0) // coin type
            .deriveHardened(index); // account
        // child has 32 bytes private key
        return child;
    };
    // Address is used for receiving and sending BTC
    static getAddressFromAccount = async (parentAccount, change = 0, index = 0) => {
        // derived child address from parentAccount
        const child = parentAccount
            .derive(change) // external use default
            .derive(index); // address to use
        // child has 32 bytes private key, used for btc address private key directly
        return child;
    };
    // In case you want to get deeper(than BIP 44 level) account
    static getChildFromAddress = async (parentAddress, index = 0) => {
        // derived child account from parentAddress
        const child = parentAddress.deriveHardened(index); // when deeper than BIP44 scope, let's harden for security
        // child has 32 bytes private key, used for btc wallet private key directly
        return child;
    };
    // get compressed pubkey in BTC network
    static generateBtcAddress = async (btcAddressPotential, btcNetwork = BtcNetwork_js_1.default.Mainnet) => {
        // latest version: SegWit
        const payment = bitcoin.payments.p2wpkh({
            pubkey: btcAddressPotential.publicKey,
            network: btcNetwork === 'mainnet'
                ? bitcoin.networks.bitcoin
                : bitcoin.networks.testnet,
        });
        return payment.address;
    };
    // encrypt mnemonic with scrypt key derived from password
    static generateEncryptedVault = async (mnemonic, password, security) => {
        const salt = crypto.getRandomValues(new Uint8Array(32));
        // get scrypt derived key from password
        const N = security === 'strong' ? 2 ** 14 : 2 ** 12; // The CPU/memory cost; increases the overall difficulty
        const r = 8; // The block size; increases the dependency on memory latency and bandwidth
        const p = security === 'strong' ? 8 : 1; // The parallelization cost; increases the dependency on multi-processing
        const dkLen = 32; // digested key length
        const ec = new TextEncoder(); // utf-8 text to Uint8Array
        const pw = ec.encode(password);
        const scryptKey = await scrypt_js_1.default.scrypt(pw, salt, N, r, p, dkLen);
        // aes-256-ctr is implemented as symmetric key encryption
        const aesCtr = new aes_js_1.CTR(scryptKey);
        const encryptedMnemonic = aesCtr.encrypt(ec.encode(mnemonic));
        // convert encryptedVault and salt to hex string
        const encryptedMnemonicHex = await RareData_js_1.default.bytesToHex(encryptedMnemonic);
        const saltHex = await RareData_js_1.default.bytesToHex(salt);
        return saltHex + encryptedMnemonicHex;
    };
    // decrypt mnemonic with password & encryptedMnemonic
    static decryptVault = async (encryptedVaultStr, password, security) => {
        // seperate salt and encrypedMnemonic
        const salt = await RareData_js_1.default.hexToBytes(encryptedVaultStr.slice(0, 64));
        const encryptedMnemonic = await RareData_js_1.default.hexToBytes(encryptedVaultStr.slice(64));
        // get scrypt derived key from password
        const N = security === 'strong' ? 2 ** 14 : 2 ** 12; // The CPU/memory cost; increases the overall difficulty
        const r = 8; // The block size; increases the dependency on memory latency and bandwidth
        const p = security === 'strong' ? 8 : 1; // The parallelization cost; increases the dependency on multi-processing
        const dkLen = 32; // digested key length
        const ec = new TextEncoder(); // utf-8 text to Uint8Array
        const pw = ec.encode(password);
        const scryptKey = await scrypt_js_1.default.scrypt(pw, salt, N, r, p, dkLen);
        // aes-256-ctr is implemented as symmetric key decryption
        const aesCtr = new aes_js_1.CTR(scryptKey);
        const decryptedVault = aesCtr.decrypt(encryptedMnemonic);
        return new TextDecoder().decode(decryptedVault);
    };
}
exports.default = BtcWallet;
