declare class RareData {
    static encryptData: (publicKeyHexTo: string, data: string) => Promise<string>;
    static decryptData: (privateKeyHex: string, encryptedData: string) => Promise<string>;
    static encryptDataShared: (privateKeyHexA: string, publicKeyHexB: string, data: string) => Promise<string>;
    static decryptDataShared: (privateKeyHexB: string, publicKeyHexA: string, encryptedDataSharedStr: string) => Promise<string>;
}
export default RareData;
