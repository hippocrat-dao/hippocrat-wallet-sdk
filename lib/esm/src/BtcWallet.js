import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecPair from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import wif from 'wif';
import * as bip32 from 'bip32';
import crypto from 'crypto';
import scrypt from 'scrypt-js';
import * as liquid from 'liquidjs-lib';
const ALGO = 'aes-256-gcm';
class BtcWallet {
    // HD wallet will be for both ion and bitcoin
    static generateWalletMnemonic = async () => {
        // random mnemonic 12 words generated
        const mnemonic = bip39.generateMnemonic();
        return mnemonic;
    };
    // derive child account from BTC HD wallet
    static getAccountFromMnemonic = async (mnemonic, index = 0) => {
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        // hd wallet(master wallet)
        const root = bip32.BIP32Factory(ecc).fromSeed(seed);
        // derived child account from hd(to manage BTC)
        const child = root
            .deriveHardened(44) // purpose
            .deriveHardened(0) // coin type
            .deriveHardened(index); // account
        // child has 32 bytes private key
        return child;
    };
    // Address is used for receiving and sending BTC
    static getAddressFromAccount = async (parentAccount, index = 0) => {
        // derived child address from parentAccount
        const child = parentAccount
            .derive(0) // for external use only
            .derive(index); // address to use
        // child has 32 bytes private key, used for btc address private key directly
        return child;
    };
    // In case you want to get deeper(than BIP 44 level) account
    static getChildFromAddress = async (parentAddress, index = 0) => {
        // derived child account from parentAddress
        const child = parentAddress
            .derive(index); // address to use
        // child has 32 bytes private key, used for btc wallet private key directly
        return child;
    };
    /*
    Used for various purpose(ex) IonDid, RareData) where elliptic curve required,
    seperated from BTC accounts & addresses for security reasons,
    while using same mnemoinc.
    Directly get non-btc purpose account from mnemonic easily!
    */
    static getNonBtcAccountFromMnemonic = async (mnemonic, purpose = 0, index = 0) => {
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        // hd wallet(master wallet)
        const root = bip32.BIP32Factory(ecc).fromSeed(seed);
        const child = root
            .deriveHardened(44) // purpose
            .deriveHardened(0) // coin type
            .deriveHardened(0) // account
            .derive(0) // for external use only
            .derive(0) // address to use
            .derive(purpose) // ex) ION = 0, RareData = 1
            .derive(index); // account to use
        // child has 32 bytes private key of EC, used for various purposes
        return child;
    };
    // get compressed pubkey in BTC network
    static generateBtcAddress = async (btcAddressPotential, btcNetwork) => {
        /* wif stands for Wallet Import Format,
           need to encode private key to import wallet */
        const wifEncodedKey = wif.encode(128, btcAddressPotential.privateKey, true);
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
    // encrypt mnemonic with scrypt key derived from password
    static generateEncryptedVault = async (mnemonic, password) => {
        // generate salt
        const salt = crypto.randomBytes(32);
        // get scrypt derived key from password
        const N = 2 ** 14; // The CPU/memory cost; increases the overall difficulty
        const r = 8; // The block size; increases the dependency on memory latency and bandwidth
        const p = 1; // The parallelization cost; increases the dependency on multi-processing
        const dkLen = 32; // digested key length
        const scryptKey = await scrypt.scrypt(Buffer.from(password, 'utf-8'), salt, N, r, p, dkLen);
        // aes-256-gcm is implemented as symmetric key encryption
        const initializationVector = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGO, scryptKey, initializationVector);
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
        const scryptKey = await scrypt.scrypt(Buffer.from(password, 'utf-8'), salt, N, r, p, dkLen);
        // aes-256-gcm is implemented as symmetric key decryption
        const decipher = crypto.createDecipheriv(ALGO, scryptKey, initializationVector);
        decipher.setAuthTag(tag);
        const firstChunk = decipher.update(encryptedMnemonic);
        const secondChunk = decipher.final();
        return Buffer.concat([firstChunk, secondChunk]).toString();
    };
    // encrypt mnemonic with pbkdf2 key derived from password
    static generateEncryptedVaultLegacy = async (mnemonic, password) => {
        // generate salt
        const salt = crypto.randomBytes(32);
        // pbkdf2 is slow for security(310,000 is recommendation of OWASP)
        const pbkdf2Key = crypto.pbkdf2Sync(Buffer.from(password, 'utf-8'), salt, 310000, 32, 'sha256');
        // aes-256-gcm is implemented as symmetric key encryption
        const initializationVector = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGO, pbkdf2Key, initializationVector);
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
        const pbkdf2Key = crypto.pbkdf2Sync(Buffer.from(password, 'utf-8'), salt, 310000, 32, 'sha256');
        // aes-256-gcm is implemented as symmetric key decryption
        const decipher = crypto.createDecipheriv(ALGO, pbkdf2Key, initializationVector);
        decipher.setAuthTag(tag);
        const firstChunk = decipher.update(encryptedMnemonic);
        const secondChunk = decipher.final();
        return Buffer.concat([firstChunk, secondChunk]).toString();
    };
}
export default BtcWallet;
