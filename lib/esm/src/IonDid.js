import * as ION from '@decentralized-identity/ion-tools';
import * as Secp256k1 from '@noble/secp256k1';
import { base64url } from 'multiformats/bases/base64';
import keyto from '@trust/keyto';
class IonDid {
    // generateKeyPair with key of btcAccount
    static generateKeyPair = async (ionAccountPotential) => {
        const privateKeyBytes = ionAccountPotential.privateKey;
        const publicKeyBytes = await Secp256k1.getPublicKey(privateKeyBytes);
        const d = base64url.baseEncode(privateKeyBytes);
        // skip the first byte because it's used as a header to indicate whether the key is uncompressed
        const x = base64url.baseEncode(publicKeyBytes.subarray(1, 33));
        const y = base64url.baseEncode(publicKeyBytes.subarray(33, 65));
        const publicJwk = {
            // alg: 'ES256K',
            kty: 'EC',
            crv: 'secp256k1',
            x,
            y
        };
        const privateJwk = { ...publicJwk, d };
        return { publicJwk, privateJwk };
    };
    // generate did with public key
    static createDid = async (ionKeyPair, ionServices) => {
        const ionDid = {
            operation: 'create',
            content: {
                // Register the public key for authentication(private key belongs to user)
                publicKeys: [
                    {
                        id: 'auth-key',
                        type: 'EcdsaSecp256k1VerificationKey2019',
                        publicKeyJwk: ionKeyPair.publicJwk,
                        purposes: ['authentication']
                    }
                ],
                // Register an IdentityHub as a service
                services: ionServices
            },
            recovery: ionKeyPair,
            update: ionKeyPair
        };
        return ionDid;
    };
    // did short uri by instance(only resolvable after did published to ION network)
    static getDidUriShort = async (did) => {
        const didForOps = await this._getDidOpsFromModel(did);
        const shortFormUri = await didForOps.getURI("short");
        return shortFormUri;
    };
    // did long uri by instance(able to use instantly without anchoring)
    static getDidUriLong = async (did) => {
        const didForOps = await this._getDidOpsFromModel(did);
        const longFormUri = await didForOps.getURI();
        return longFormUri;
    };
    // submit ion did on bitcoin chain -> default node is run by Microsoft
    static anchorRequest = async (did) => {
        const didForOps = await this._getDidOpsFromModel(did);
        const anchorRequest = await didForOps.generateRequest();
        const anchorResponse = await ION.anchor(anchorRequest);
        return JSON.parse(anchorResponse);
    };
    // resolve published did if uri in short, unpublished one it in long
    static getDidResolved = async (didUri) => {
        const didResolved = await ION.resolve(didUri);
        return didResolved;
    };
    // sign message with ion did(kind of auth)
    static signMessage = async (msg, ionPrivateJwk) => {
        return await ION.sign({ payload: msg, privateJwk: ionPrivateJwk });
    };
    // verify message from json web signature signed by ion did
    static verifyMessage = async (signedMsg, ionPublicJwk) => {
        return await ION.verify({ jws: signedMsg, publicJwk: ionPublicJwk });
    };
    // convert privateJwk to hex
    static privateKeyHexFromJwk = async (privateJwk) => {
        return keyto
            .from({
            ...privateJwk,
            crv: 'K-256',
        }, 'jwk')
            .toString('blk', 'private');
    };
    // convert publicJwk to hex
    static publicKeyHexFromJwk = async (publicJwk) => {
        return keyto
            .from({
            ...publicJwk,
            crv: 'K-256',
        }, 'jwk')
            .toString('blk', 'public');
    };
    static _getDidOpsFromModel = async (did) => {
        const didForOps = new ION.DID({ ops: [did] });
        return didForOps;
    };
}
export default IonDid;
