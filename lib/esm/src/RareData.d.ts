declare class RareData {
    static encryptData: (toPubKeyHex: string, data: string, fromPrivKeyHex?: string) => Promise<string>;
    static decryptData: (privKeyHex: string, encryptedData: string) => Promise<string>;
    static bytesToHex: (data: Uint8Array) => Promise<string>;
    static hexToBytes: (data: string) => Promise<Uint8Array>;
    static sha256: (message: string) => Promise<string>;
}
export default RareData;
