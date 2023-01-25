import * as ION from '@decentralized-identity/ion-tools';
import {Buffer} from 'buffer';
import * as Secp256k1 from '@noble/secp256k1';
import IonService from './models/IonService';
import IonDidModel from './models/IonDidModel';
import IonDidResolved from './models/IonDidResolved';
import BtcAccount from './models/BtcAccount';
import IonKeyPair from './models/IonKeyPair';

class IonDid {
  // generateKeyPair with key of btcAccount
  static generateKeyPair = async (ionAccountPotential : BtcAccount)
  : Promise<IonKeyPair> => {
    const d : string = (ionAccountPotential.privateKey as Buffer).toString('base64url');
    const uncompressedPubKey : Buffer = Buffer.from(
      Secp256k1.getPublicKey(ionAccountPotential.privateKey as Buffer));
    // skip the first byte because it's used as a header to indicate whether the key is uncompressed
    const x : string = uncompressedPubKey.slice(1, 33).toString('base64url');
    const y : string = uncompressedPubKey.slice(33, 65).toString('base64url');

    const publicJwk = {
      // alg: 'ES256K',
      kty: 'EC',
      crv: 'secp256k1',
      x,
      y
    };
    const privateJwk = { ...publicJwk, d };

    return {publicJwk, privateJwk};
  } 
  // generate did with public key
  static createDid = async (ionKeyPair : IonKeyPair, ionServices?: IonService[])
  : Promise<IonDidModel> => {
    const ionDid : IonDidModel = {
      operation: 'create',
      content: {
        // Register the public key for authentication(private key belongs to user)
        publicKeys: [
          {
            id: 'auth-key' as string,
            type: 'EcdsaSecp256k1VerificationKey2019' as 'EcdsaSecp256k1VerificationKey2019',
            publicKeyJwk: ionKeyPair.publicJwk as JsonWebKey,
            purposes: [ 'authentication' ] as string[]
          }
        ] as any[],
        // Register an IdentityHub as a service
        services: ionServices as IonService[]
      },
      recovery: ionKeyPair,
      update: ionKeyPair
    }
    return ionDid;
  }
  // did short uri by instance(only resolvable after did published to ION network)
  static getDidUriShort = async (did: IonDidModel) 
  : Promise<string> => {
    const didForOps : ION.DID = await this._getDidOpsFromModel(did);
    const shortFormUri : string = await didForOps.getURI("short");
    return shortFormUri;
  }
  // did long uri by instance(able to use instantly without anchoring)
  static getDidUriLong = async (did: IonDidModel) 
  : Promise<string> => {
    const didForOps : ION.DID = await this._getDidOpsFromModel(did);
    const longFormUri : string = await didForOps.getURI();
    return longFormUri;
  }
  // submit ion did on bitcoin chain -> default node is run by Microsoft
  static anchorDidOnChain = async (did: IonDidModel) 
  : Promise<IonDidResolved> => {
    const didForOps : ION.DID = await this._getDidOpsFromModel(did);
    const anchorRequest : any = await didForOps.generateRequest();
    const anchorResponse : string = await ION.anchor(anchorRequest);
    return JSON.parse(anchorResponse);
  }
  // resolve published did if uri in short, unpublished one it in long
  static getDidResolved = async (didUri: string)
  : Promise<IonDidResolved> => {
    const didResolved : IonDidResolved = await ION.resolve(didUri);
    return didResolved;
  }
  // sign message with ion did(kind of auth)
  static signMessage = async (msg: string, ionPrivateJwk : JsonWebKey)
  : Promise<string> => {
    return await ION.sign({payload: msg, privateJwk: ionPrivateJwk})
  }
  // verify message from json web signature signed by ion did
  static verifyMessage = async (signedMsg: string, ionPublicJwk : JsonWebKey)
  : Promise<boolean> => {
    return await ION.verify({jws: signedMsg, publicJwk: ionPublicJwk})
  }
  // convert privateJwk to hex
  static privateKeyHexFromJwk = async (privateJwk : JsonWebKey) 
  : Promise<string> => {
    return Buffer.from(
      privateJwk.d as string, 'base64url').toString('hex');
  }
  // convert publicJwk to hex(default conpressed)
  static publicKeyHexFromJwk = async (publicJwk: JsonWebKey, compressed = true) 
  : Promise<string> => {
    const pointX = Buffer.from(
      publicJwk.x as string,'base64url').toString('hex');
    const pointY = Buffer.from(
      publicJwk.y as string,'base64url').toString('hex');
    return compressed? 
           BigInt("0x" + pointY) % 2n === 0n ? "02" + pointX : "03" + pointX
           : "04" + pointX + pointY
  };

  private static _getDidOpsFromModel = async (did: IonDidModel)
  : Promise<ION.DID> => {
    const didForOps : ION.DID = new ION.DID({ops: [did] as IonDidModel[]});
    return didForOps;
  }
}

export default IonDid;