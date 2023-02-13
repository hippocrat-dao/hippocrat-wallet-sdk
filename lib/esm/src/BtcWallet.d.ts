import BtcNetwork from './enums/BtcNetwork';
import BtcAccount from './models/BtcAccount';
declare class BtcWallet {
    static generateWalletMnemonic: () => Promise<string>;
    static isMnemonicValid: (mnemonic: string) => Promise<boolean>;
    static getAccountFromMnemonic: (mnemonic: string, index?: number) => Promise<BtcAccount>;
    static getAddressFromAccount: (parentAccount: BtcAccount, index?: number) => Promise<BtcAccount>;
    static getChildFromAddress: (parentAddress: BtcAccount, index?: number) => Promise<BtcAccount>;
    static getNonBtcAccountFromMnemonic: (mnemonic: string, purpose?: number, index?: number) => Promise<BtcAccount>;
    static generateBtcAddress: (btcAddressPotential: BtcAccount, btcNetwork?: BtcNetwork) => Promise<string>;
    static generateEncryptedVault: (mnemonic: string, password: string) => Promise<string>;
    static decryptVault: (encryptedVaultStr: string, password: string) => Promise<string>;
    static generateEncryptedVaultLegacy: (mnemonic: string, password: string) => Promise<string>;
    static decryptVaultLegacy: (encryptedVaultStr: string, password: string) => Promise<string>;
}
export default BtcWallet;
