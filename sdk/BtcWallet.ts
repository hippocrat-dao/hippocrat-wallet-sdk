import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecPair from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import wif from 'wif';
import * as bip32 from 'bip32';
import crypto from 'crypto';
import * as liquid from 'liquidjs-lib';
import BtcNetwork from './enums/BtcNetwork';
import BIP32Interface from './models/BIP32Interface';

const ALGO : crypto.CipherGCMTypes = 'aes-256-gcm';

class BtcWallet{
    // HD wallet will be for both ion and bitcoin
    static generateWalletMnemonic = async () 
    : Promise<string> => {
        // korean phrase for UX
        bip39.setDefaultWordlist('korean' as string) as void;
        // random mnemonic 12 words generated
        const mnemonic : string = bip39.generateMnemonic();
        return mnemonic;
    }
    // derive child from BTC HD wallet
    static getChildFromMnemonic = async (mnemonic : string)
    : Promise<BIP32Interface> => {
        const seed : Buffer = bip39.mnemonicToSeedSync(mnemonic);
        // hd wallet(master wallet)
        const root : bip32.BIP32Interface = bip32.BIP32Factory(
            ecc as bip32.TinySecp256k1Interface).fromSeed(seed)
        // derived child wallet from hd(potential to be btc wallet)
        const child : bip32.BIP32Interface = root
            .deriveHardened(0 as number)
            .derive(0 as number)
            .derive(0 as number);
        // child has 32 bytes private key, used for btc wallet private key directly
        return child;
    }
    // Accounts are descendants of Mnemonic(HD wallet)
    static getChildFromAccount = async (parentAccount : BIP32Interface)
    : Promise<BIP32Interface> => {
        // derived child account from parentAccount
        const child : bip32.BIP32Interface = parentAccount
            .deriveHardened(0 as number)
            .derive(0 as number)
            .derive(0 as number);
        // child has 32 bytes private key, used for btc wallet private key directly
        return child;
    }
    // Account is propogated in BTC network
    static generateBtcAddressFromAccount = async (
        btcAccountPotential : BIP32Interface,
        btcNetwork : BtcNetwork) 
    : Promise<string> => {
        /* wif stands for Wallet Import Format, 
           need to encode private key to import wallet */
        const wifEncodedKey : string = wif.encode(128 as number, 
            btcAccountPotential.privateKey as Buffer, true as boolean
        );
        const keyPair : ecPair.ECPairInterface = ecPair
        .ECPairFactory(ecc as ecPair.TinySecp256k1Interface)
        .fromWIF(wifEncodedKey);
        // latest version: SegWit
        const payment : bitcoin.payments.Payment = bitcoin.payments.p2wpkh({
            pubkey: keyPair.publicKey as Buffer,
            network: 
                btcNetwork === "mainnet" ? 
                bitcoin.networks.bitcoin
                : btcNetwork === "testnet" ? 
                bitcoin.networks.testnet
                : btcNetwork == "liquid" ?
                liquid.networks.liquid
                : liquid.networks.testnet as bitcoin.networks.Network 
            });
        return payment.address as string;
    }
    // encrypt mnemonic with pbkdf2 key derived from password
    static generateEncryptedVault = async (mnemonic: string, password: string) 
    : Promise<string> => {
        // generate salt
        const salt : Buffer = crypto.randomBytes(32);
        // pbkdf2 is slow for security(310,000 is recommendation of OWASP)
        const pbkdf2Key : Buffer = crypto.pbkdf2Sync(
            Buffer.from(password, 'utf-8'), 
            salt,
            310000, 32, 'sha256');
        // aes-256-gcm is implemented as symmetric key encryption
        const initializationVector : Buffer = crypto.randomBytes(16);
        const cipher : crypto.CipherGCM = crypto.createCipheriv(
            ALGO, 
            pbkdf2Key, 
            initializationVector);
        const firstChunk : Buffer = cipher.update(mnemonic);
        const secondChunk : Buffer = cipher.final();
        const tag = cipher.getAuthTag();
        const encryptedVault = Buffer.concat([firstChunk, secondChunk, tag,
            salt, initializationVector]);
        return encryptedVault.toString('base64');
    }
    // decrypt mnemonic with password & encryptedMnemonic
    static decryptVault = async (encryptedVaultStr: string, password: string) 
    : Promise<string> => {
        const encryptedVault : Buffer = Buffer.from(encryptedVaultStr,'base64');
        // seperate mnemonic, salt and iv
        const initializationVector : Buffer = encryptedVault.slice(
            encryptedVault.length-16);
        const salt : Buffer = encryptedVault.slice(
            encryptedVault.length-48, 
            encryptedVault.length-16);
        const tag : Buffer = encryptedVault.slice(
            encryptedVault.length-64, 
            encryptedVault.length-48);
        const encryptedMnemonic : Buffer = encryptedVault.slice(
            0, encryptedVault.length-64);
        // pbkdf2 is slow for security
        const pbkdf2Key : Buffer = crypto.pbkdf2Sync(
            Buffer.from(password, 'utf-8'), 
            salt,
            310000, 32, 'sha256');
        // aes-256-gcm is implemented as symmetric key decryption
        const decipher : crypto.DecipherGCM = crypto.createDecipheriv(
            ALGO, pbkdf2Key, initializationVector);
        decipher.setAuthTag(tag);
        const firstChunk : Buffer = decipher.update(encryptedMnemonic);
        const secondChunk : Buffer = decipher.final();
        return Buffer.concat([firstChunk, secondChunk]).toString() as string;
    }
}

export default BtcWallet;
