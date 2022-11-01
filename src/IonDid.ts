import ION from '@decentralized-identity/ion-tools';
import { Secp256k1KeyPair } from '@transmute/did-key-secp256k1';
import { BIP32Interface } from 'bip32';

interface IonService {
  id: string,
  type: string,
  service: string
}

class IonDid {
  // generateKeyPair with key of btcAccount
  static generateKeyPair = async (ionAccountPotential : BIP32Interface)
  : Promise<any> => {
    const keyPair : Secp256k1KeyPair = await Secp256k1KeyPair
    .generate({
      secureRandom: () => ionAccountPotential.privateKey as Buffer
    });
    const jsonWebKeyPair : any = await keyPair.export({
      type: 'JsonWebKey2020' as 'JsonWebKey2020',
      privateKey: true as boolean
    });
    return jsonWebKeyPair;
  } 
  // generate did with public key
  static createDid = async (jsonWebKeyPair : any, ionServices?: IonService[])
  : Promise<ION.DID> => {
    const did : ION.DID = new ION.DID({
      content: {
        // Register the public key for authentication(private key belongs to user)
        publicKeys: [
          {
            id: 'auth-key' as string,
            type: 'EcdsaSecp256k1VerificationKey2019' as 'EcdsaSecp256k1VerificationKey2019',
            publicKeyJwk: jsonWebKeyPair.publicKeyJwk as any,
            purposes: [ 'authentication' ] as string[]
          }
        ] as any[],
        // Register an IdentityHub as a service
        services: ionServices
     }})
     return await did;
  }
  // did short uri by instance(only resolvable after did published to ION network)
  static getDidUriShort = async (did: ION.DID) 
  : Promise<string> => {
    const shortFormUri : string = await did.getURI("short");
    return shortFormUri;
  }
  // did long uri by instance(able to use instantly without anchoring)
  static getDidUriLong = async (did: ION.DID) 
  : Promise<string> => {
    const longFormUri : string = await did.getURI();
    return longFormUri;
  }
  // submit ion did on bitcoin chain -> default node is run by Microsoft
  static anchorRequest = async (did: ION.DID) 
  : Promise<string> => {
    const anchorRequestBody : any = await did.generateRequest();
    const anchorRequest : any = new ION.AnchorRequest(anchorRequestBody);
    const anchorResponse : any = await anchorRequest.submit();
    return JSON.stringify(await anchorResponse);
  }
  // resolve published did if uri in short, unpublished one it in long
  static getDidResolved = async (didUri: string)
  : Promise<any> => {
    const didResolved : any = await ION.resolve(didUri);
    return await didResolved;
  }
}

export default IonDid;