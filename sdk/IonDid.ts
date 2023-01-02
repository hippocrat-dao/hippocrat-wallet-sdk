import * as ION from '@decentralized-identity/ion-tools';
import * as Secp256k1 from '@noble/secp256k1';
import { base64url } from 'multiformats/bases/base64';
import keyto from '@trust/keyto';
import IonService from './models/IonService';
import IonDidModel from './models/IonDidModel';
import IonDidResolved from './models/IonDidResolved';
import BtcAccount from './models/BtcAccount';
import IonKeyPair from './models/IonKeyPair';

class IonDid {
  // generateKeyPair with key of btcAccount
  static generateKeyPair = async (ionAccountPotential : BtcAccount)
  : Promise<IonKeyPair> => {
    const privateKeyBytes = ionAccountPotential.privateKey as Uint8Array;
    const publicKeyBytes = await Secp256k1.getPublicKey(privateKeyBytes);

    const d : string = base64url.baseEncode(privateKeyBytes);
    // skip the first byte because it's used as a header to indicate whether the key is uncompressed
    const x : string = base64url.baseEncode(publicKeyBytes.subarray(1, 33));
    const y : string = base64url.baseEncode(publicKeyBytes.subarray(33, 65));

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
  static anchorRequest = async (did: IonDidModel) 
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
  // convert privateJwk to hex
  static privateKeyHexFromJwk = async (privateJwk : JsonWebKey) 
  : Promise<string> => {
    return keyto
      .from(
        {
          ...privateJwk,
          crv: 'K-256' as string,
        },
        'jwk' as string
      )
      .toString('blk' as string, 'private' as string) as string;
  }
  // convert publicJwk to hex
  static publicKeyHexFromJwk = async (publicJwk: JsonWebKey) 
  : Promise<string> => {
    return keyto
      .from(
        {
          ...publicJwk,
          crv: 'K-256' as string,
        },
        'jwk' as string
      )
      .toString('blk' as string, 'public' as string) as string;
  };

  private static _getDidOpsFromModel = async (did: IonDidModel)
  : Promise<ION.DID> => {
    const didForOps : ION.DID = new ION.DID({ops: [did] as IonDidModel[]});
    return didForOps;
  }
}

export default IonDid;