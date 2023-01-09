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
const ecPair = __importStar(require("ecpair"));
const ecc = __importStar(require("tiny-secp256k1"));
const wif_1 = __importDefault(require("wif"));
const bip32 = __importStar(require("bip32"));
const crypto_1 = __importDefault(require("crypto"));
const scrypt_js_1 = __importDefault(require("scrypt-js"));
const liquid = __importStar(require("liquidjs-lib"));
const ALGO = 'aes-256-gcm';
class BtcWallet {
    // HD wallet will be for both ion and bitcoin
    static generateWalletMnemonic = async () => {
        // random mnemonic 12 words generated
        const mnemonic = bip39.generateMnemonic();
        return mnemonic;
    };
    // derive child from BTC HD wallet
    static getChildFromMnemonic = async (mnemonic) => {
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        // hd wallet(master wallet)
        const root = bip32.BIP32Factory(ecc).fromSeed(seed);
        // derived child wallet from hd(potential to be btc wallet)
        const child = root
            .deriveHardened(0)
            .derive(0)
            .derive(0);
        // child has 32 bytes private key, used for btc wallet private key directly
        return child;
    };
    // Accounts are descendants of Mnemonic(HD wallet)
    static getChildFromAccount = async (parentAccount) => {
        // derived child account from parentAccount
        const child = parentAccount
            .deriveHardened(0)
            .derive(0)
            .derive(0);
        // child has 32 bytes private key, used for btc wallet private key directly
        return child;
    };
    // Account is propogated in BTC network
    static generateBtcAddressFromAccount = async (btcAccountPotential, btcNetwork) => {
        /* wif stands for Wallet Import Format,
           need to encode private key to import wallet */
        const wifEncodedKey = wif_1.default.encode(128, btcAccountPotential.privateKey, true);
        const keyPair = ecPair
            .ECPairFactory(ecc)
            .fromWIF(wifEncodedKey);
        // latest version: SegWit
        const payment = bitcoin.payments.p2wpkh({
            pubkey: keyPair.publicKey,
            network: btcNetwork === "mainnet" ?
                bitcoin.networks.bitcoin
                : btcNetwork === "testnet" ?
                    bitcoin.networks.testnet
                    : btcNetwork == "liquid" ?
                        liquid.networks.liquid
                        : liquid.networks.testnet
        });
        return payment.address;
    };
    // encrypt mnemonic with pbkdf2 key derived from password
    static generateEncryptedVault = async (mnemonic, password) => {
        // generate salt
        const salt = crypto_1.default.randomBytes(32);
        // get scrypt derived key from password
        const N = 2 ** 14; // The CPU/memory cost; increases the overall difficulty
        const r = 8; // The block size; increases the dependency on memory latency and bandwidth
        const p = 1; // The parallelization cost; increases the dependency on multi-processing
        const dkLen = 32; // digested key length
        const scryptKey = await scrypt_js_1.default.scrypt(Buffer.from(password, 'utf-8'), salt, N, r, p, dkLen);
        // aes-256-gcm is implemented as symmetric key encryption
        const initializationVector = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv(ALGO, scryptKey, initializationVector);
        const firstChunk = cipher.update(mnemonic);
        const secondChunk = cipher.final();
        const tag = cipher.getAuthTag();
        const encryptedVault = Buffer.concat([firstChunk, secondChunk, tag,
            salt, initializationVector]);
        return encryptedVault.toString('base64');
    };
    // decrypt mnemonic with password & encryptedMnemonic
    static decryptVault = async (encryptedVaultStr, password) => {
        const encryptedVault = Buffer.from(encryptedVaultStr, 'base64');
        // seperate mnemonic, salt and iv
        const initializationVector = encryptedVault.slice(encryptedVault.length - 16);
        const salt = encryptedVault.slice(encryptedVault.length - 48, encryptedVault.length - 16);
        const tag = encryptedVault.slice(encryptedVault.length - 64, encryptedVault.length - 48);
        const encryptedMnemonic = encryptedVault.slice(0, encryptedVault.length - 64);
        // get scrypt derived key from password
        const N = 2 ** 14; // The CPU/memory cost; increases the overall difficulty
        const r = 8; // The block size; increases the dependency on memory latency and bandwidth
        const p = 1; // The parallelization cost; increases the dependency on multi-processing
        const dkLen = 32; // digested key length
        const scryptKey = await scrypt_js_1.default.scrypt(Buffer.from(password, 'utf-8'), salt, N, r, p, dkLen);
        // aes-256-gcm is implemented as symmetric key decryption
        const decipher = crypto_1.default.createDecipheriv(ALGO, scryptKey, initializationVector);
        decipher.setAuthTag(tag);
        const firstChunk = decipher.update(encryptedMnemonic);
        const secondChunk = decipher.final();
        return Buffer.concat([firstChunk, secondChunk]).toString();
    };
    // encrypt mnemonic with pbkdf2 key derived from password
    static generateEncryptedVaultLegacy = async (mnemonic, password) => {
        // generate salt
        const salt = crypto_1.default.randomBytes(32);
        // pbkdf2 is slow for security(310,000 is recommendation of OWASP)
        const pbkdf2Key = crypto_1.default.pbkdf2Sync(Buffer.from(password, 'utf-8'), salt, 310000, 32, 'sha256');
        // aes-256-gcm is implemented as symmetric key encryption
        const initializationVector = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv(ALGO, pbkdf2Key, initializationVector);
        const firstChunk = cipher.update(mnemonic);
        const secondChunk = cipher.final();
        const tag = cipher.getAuthTag();
        const encryptedVault = Buffer.concat([firstChunk, secondChunk, tag,
            salt, initializationVector]);
        return encryptedVault.toString('base64');
    };
    // decrypt mnemonic with password & encryptedMnemonic
    static decryptVaultLegacy = async (encryptedVaultStr, password) => {
        const encryptedVault = Buffer.from(encryptedVaultStr, 'base64');
        // seperate mnemonic, salt and iv
        const initializationVector = encryptedVault.slice(encryptedVault.length - 16);
        const salt = encryptedVault.slice(encryptedVault.length - 48, encryptedVault.length - 16);
        const tag = encryptedVault.slice(encryptedVault.length - 64, encryptedVault.length - 48);
        const encryptedMnemonic = encryptedVault.slice(0, encryptedVault.length - 64);
        // pbkdf2 is slow for security
        const pbkdf2Key = crypto_1.default.pbkdf2Sync(Buffer.from(password, 'utf-8'), salt, 310000, 32, 'sha256');
        // aes-256-gcm is implemented as symmetric key decryption
        const decipher = crypto_1.default.createDecipheriv(ALGO, pbkdf2Key, initializationVector);
        decipher.setAuthTag(tag);
        const firstChunk = decipher.update(encryptedMnemonic);
        const secondChunk = decipher.final();
        return Buffer.concat([firstChunk, secondChunk]).toString();
    };
}
exports.default = BtcWallet;
