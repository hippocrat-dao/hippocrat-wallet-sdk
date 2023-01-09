import ECIES from './models/ECIES';
declare class RareData {
    static encryptData: (publicKeyHexTo: string, data: string) => Promise<ECIES>;
    static decryptData: (privateKeyHex: string, encryptedData: ECIES) => Promise<string>;
    static encryptDataShared: (privateKeyHexA: string, publicKeyHexB: string, data: string) => Promise<string>;
    static decryptDataShared: (privateKeyHexB: string, publicKeyHexA: string, encryptedDataSharedStr: string) => Promise<string>;
}
export default RareData;
