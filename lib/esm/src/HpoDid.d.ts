import HpoDidModel from './models/HpoDidModel.js';
declare class HpoDid {
    static create: (privateKey: string) => Promise<HpoDidModel>;
    static sign: (privateKey: string, message?: string) => Promise<string>;
    static verify: (publicKey: string, signature: string, message?: string) => Promise<boolean>;
}
export default HpoDid;
