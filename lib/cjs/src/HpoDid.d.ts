import HpoDidModel from './models/HpoDidModel';
declare class HpoDid {
    static createDid: (mnemonic: string, purpose?: number, index?: number) => Promise<HpoDidModel>;
}
export default HpoDid;
