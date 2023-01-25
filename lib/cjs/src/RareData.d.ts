declare class RareData {
    static encryptData: (toPubKeyHex: string, data: string, fromPrivKeyHex?: string) => Promise<string>;
    static decryptData: (privKeyHex: string, encryptedData: string) => Promise<string>;
}
export default RareData;
