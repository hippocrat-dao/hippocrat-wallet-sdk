import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import * as bip32 from 'bip32';
import * as crypto from 'crypto-browserify';
import { Buffer } from 'buffer';
import scrypt from 'scrypt-js';
import BtcNetwork from './enums/BtcNetwork.js';
import BtcAccount from './models/BtcAccount.js';
import MnemonicLang from './enums/MnemonicLang.js';

const ALGO: crypto.CipherGCMTypes = 'aes-256-gcm';

class BtcWallet {
	// HD wallet will be for both ion and bitcoin
	static generateWalletMnemonic = async (
		language = MnemonicLang.ENGLISH,
	): Promise<string> => {
		// random mnemonic 12 words generated
		bip39.setDefaultWordlist(language);
		const mnemonic: string = bip39.generateMnemonic();
		return mnemonic;
	};
	// Mnemonic valid for bip39 wallet?
	static isMnemonicValid = async (
		mnemonic: string,
		language = MnemonicLang.ENGLISH,
	): Promise<boolean> => {
		bip39.setDefaultWordlist(language);
		return bip39.validateMnemonic(mnemonic);
	};
	// derive child account from BTC HD wallet
	static getAccountFromMnemonic = async (
		mnemonic: string,
		index = 0,
	): Promise<BtcAccount> => {
		const seed: Buffer = await bip39.mnemonicToSeed(mnemonic);
		// hd wallet(master wallet)
		const root: bip32.BIP32Interface = bip32
			.BIP32Factory(ecc as bip32.TinySecp256k1Interface)
			.fromSeed(seed);
		// derived child account from hd(to manage BTC)
		const child: bip32.BIP32Interface = root
			.deriveHardened(84 as number) // purpose
			.deriveHardened(0 as number) // coin type
			.deriveHardened(index as number); // account
		// child has 32 bytes private key
		return child;
	};
	// Address is used for receiving and sending BTC
	static getAddressFromAccount = async (
		parentAccount: BtcAccount,
		change = 0,
		index = 0,
	): Promise<BtcAccount> => {
		// derived child address from parentAccount
		const child: bip32.BIP32Interface = parentAccount
			.derive(change as number) // external use default
			.derive(index as number); // address to use
		// child has 32 bytes private key, used for btc address private key directly
		return child;
	};
	// In case you want to get deeper(than BIP 44 level) account
	static getChildFromAddress = async (
		parentAddress: BtcAccount,
		index = 0,
	): Promise<BtcAccount> => {
		// derived child account from parentAddress
		const child: bip32.BIP32Interface = parentAddress.deriveHardened(
			index as number,
		); // when deeper than BIP44 scope, let's harden for security
		// child has 32 bytes private key, used for btc wallet private key directly
		return child;
	};
	/* 
    Used for various purpose(ex) Hippocrat DID, RareData) where elliptic curve required,
    seperated(while deriveHardened) from BTC accounts & addresses for security reasons,
    while using same mnemoinc.
    Directly get non-btc purpose account from mnemonic easily!
    */
	static getNonBtcAccountFromMnemonic = async (
		mnemonic: string,
		purpose = 0,
		index = 0,
	): Promise<BtcAccount> => {
		const seed: Buffer = await bip39.mnemonicToSeed(mnemonic);
		// hd wallet(master wallet)
		const root: bip32.BIP32Interface = bip32
			.BIP32Factory(ecc as bip32.TinySecp256k1Interface)
			.fromSeed(seed);
		const child: bip32.BIP32Interface = root
			.deriveHardened(84 as number) // purpose
			.deriveHardened(0 as number) // coin type
			.deriveHardened(0 as number) // account
			.derive(0 as number) // for external use only
			.derive(0 as number) // address to use
			.deriveHardened(purpose as number) // ex) HippocratDID = 0, IonDID = 1
			.deriveHardened(index as number); // account to use
		// child has 32 bytes private key of EC, used for various purposes
		return child;
	};
	// get compressed pubkey in BTC network
	static generateBtcAddress = async (
		btcAddressPotential: BtcAccount,
		btcNetwork: BtcNetwork = BtcNetwork.Mainnet,
	): Promise<string> => {
		// latest version: SegWit
		const payment: bitcoin.payments.Payment = bitcoin.payments.p2wpkh({
			pubkey: btcAddressPotential.publicKey as Buffer,
			network:
				btcNetwork === 'mainnet'
					? bitcoin.networks.bitcoin
					: (bitcoin.networks.testnet as bitcoin.networks.Network),
		});
		return payment.address as string;
	};
	// encrypt mnemonic with scrypt key derived from password
	static generateEncryptedVault = async (
		mnemonic: string,
		password: string,
		security?: 'normal' | 'strong',
	): Promise<string> => {
		// generate salt
		const salt: Buffer = crypto.randomBytes(32);
		// get scrypt derived key from password
		const N = security === 'strong' ? 2 ** 14 : 2 ** 12; // The CPU/memory cost; increases the overall difficulty
		const r = 8; // The block size; increases the dependency on memory latency and bandwidth
		const p = security === 'strong' ? 8 : 1; // The parallelization cost; increases the dependency on multi-processing
		const dkLen = 32; // digested key length
		const scryptKey: Uint8Array = await scrypt.scrypt(
			Buffer.from(password, 'utf-8'),
			salt,
			N,
			r,
			p,
			dkLen,
		);
		// aes-256-gcm is implemented as symmetric key encryption
		const initializationVector: Buffer = crypto.randomBytes(16);
		const cipher: crypto.CipherGCM = crypto.createCipheriv(
			ALGO,
			scryptKey,
			initializationVector,
		);
		const firstChunk: Buffer = cipher.update(mnemonic);
		const secondChunk: Buffer = cipher.final();
		const tag = cipher.getAuthTag();
		const encryptedVault = Buffer.concat([
			firstChunk,
			secondChunk,
			tag,
			salt,
			initializationVector,
		]);
		return encryptedVault.toString('base64');
	};
	// decrypt mnemonic with password & encryptedMnemonic
	static decryptVault = async (
		encryptedVaultStr: string,
		password: string,
		security?: 'normal' | 'strong',
	): Promise<string> => {
		const encryptedVault: Buffer = Buffer.from(encryptedVaultStr, 'base64');
		// seperate mnemonic, salt and iv
		const initializationVector: Buffer = encryptedVault.slice(
			encryptedVault.length - 16,
		);
		const salt: Buffer = encryptedVault.slice(
			encryptedVault.length - 48,
			encryptedVault.length - 16,
		);
		const tag: Buffer = encryptedVault.slice(
			encryptedVault.length - 64,
			encryptedVault.length - 48,
		);
		const encryptedMnemonic: Buffer = encryptedVault.slice(
			0,
			encryptedVault.length - 64,
		);
		// get scrypt derived key from password
		const N = security === 'strong' ? 2 ** 14 : 2 ** 12; // The CPU/memory cost; increases the overall difficulty
		const r = 8; // The block size; increases the dependency on memory latency and bandwidth
		const p = security === 'strong' ? 8 : 1; // The parallelization cost; increases the dependency on multi-processing
		const dkLen = 32; // digested key length
		const scryptKey: Uint8Array = await scrypt.scrypt(
			Buffer.from(password, 'utf-8'),
			salt,
			N,
			r,
			p,
			dkLen,
		);
		// aes-256-gcm is implemented as symmetric key decryption
		const decipher: crypto.DecipherGCM = crypto.createDecipheriv(
			ALGO,
			scryptKey,
			initializationVector,
		);
		decipher.setAuthTag(tag);
		const firstChunk: Buffer = decipher.update(encryptedMnemonic);
		const secondChunk: Buffer = decipher.final();
		return Buffer.concat([firstChunk, secondChunk]).toString() as string;
	};
}

export default BtcWallet;
