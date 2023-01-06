import BtcNetwork from './enums/BtcNetwork';
import BtcAccount from './models/BtcAccount';
declare class BtcWallet {
    static generateWalletMnemonic: () => Promise<string>;
    static getChildFromMnemonic: (mnemonic: string) => Promise<BtcAccount>;
    static getChildFromAccount: (parentAccount: BtcAccount) => Promise<BtcAccount>;
    static generateBtcAddressFromAccount: (btcAccountPotential: BtcAccount, btcNetwork: BtcNetwork) => Promise<string>;
    static generateEncryptedVault: (mnemonic: string, password: string) => Promise<string>;
    static decryptVault: (encryptedVaultStr: string, password: string) => Promise<string>;
    static generateEncryptedVaultLegacy: (mnemonic: string, password: string) => Promise<string>;
    static decryptVaultLegacy: (encryptedVaultStr: string, password: string) => Promise<string>;
}
export default BtcWallet;
