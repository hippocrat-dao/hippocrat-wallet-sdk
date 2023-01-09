import IonService from './models/IonService';
import IonDidModel from './models/IonDidModel';
import IonDidResolved from './models/IonDidResolved';
import BtcAccount from './models/BtcAccount';
import IonKeyPair from './models/IonKeyPair';
declare class IonDid {
    static generateKeyPair: (ionAccountPotential: BtcAccount) => Promise<IonKeyPair>;
    static createDid: (ionKeyPair: IonKeyPair, ionServices?: IonService[]) => Promise<IonDidModel>;
    static getDidUriShort: (did: IonDidModel) => Promise<string>;
    static getDidUriLong: (did: IonDidModel) => Promise<string>;
    static anchorRequest: (did: IonDidModel) => Promise<IonDidResolved>;
    static getDidResolved: (didUri: string) => Promise<IonDidResolved>;
    static signMessage: (msg: string, ionPrivateJwk: JsonWebKey) => Promise<string>;
    static verifyMessage: (signedMsg: string, ionPublicJwk: JsonWebKey) => Promise<boolean>;
    static privateKeyHexFromJwk: (privateJwk: JsonWebKey) => Promise<string>;
    static publicKeyHexFromJwk: (publicJwk: JsonWebKey) => Promise<string>;
    private static _getDidOpsFromModel;
}
export default IonDid;
