import BtcNetwork from './enums/BtcNetwork.js';
import BtcAccount from './models/BtcAccount.js';
import MnemonicLang from './enums/MnemonicLang.js';
declare class BtcWallet {
    static generateWalletMnemonic: (language?: MnemonicLang) => Promise<string>;
    static isMnemonicValid: (mnemonic: string, language?: MnemonicLang) => Promise<boolean>;
    static getAccountFromMnemonic: (mnemonic: string, index?: number) => Promise<BtcAccount>;
    static getAddressFromAccount: (parentAccount: BtcAccount, change?: number, index?: number) => Promise<BtcAccount>;
    static getChildFromAddress: (parentAddress: BtcAccount, index?: number) => Promise<BtcAccount>;
    static generateBtcAddress: (btcAddressPotential: BtcAccount, btcNetwork?: BtcNetwork) => Promise<string>;
    static generateEncryptedVault: (mnemonic: string, password: string, security?: 'normal' | 'strong') => Promise<string>;
    static decryptVault: (encryptedVaultStr: string, password: string, security?: 'normal' | 'strong') => Promise<string>;
}
export default BtcWallet;
