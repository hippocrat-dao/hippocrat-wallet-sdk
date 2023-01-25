import * as ION from '@decentralized-identity/ion-tools';
import { Buffer } from 'buffer';
import * as Secp256k1 from '@noble/secp256k1';
class IonDid {
    // generateKeyPair with key of btcAccount
    static generateKeyPair = async (ionAccountPotential) => {
        const d = ionAccountPotential.privateKey.toString('base64url');
        const uncompressedPubKey = Buffer.from(Secp256k1.getPublicKey(ionAccountPotential.privateKey));
        // skip the first byte because it's used as a header to indicate whether the key is uncompressed
        const x = uncompressedPubKey.slice(1, 33).toString('base64url');
        const y = uncompressedPubKey.slice(33, 65).toString('base64url');
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
    static anchorDidOnChain = async (did) => {
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
        return Buffer.from(privateJwk.d, 'base64url').toString('hex');
    };
    // convert publicJwk to hex(default conpressed)
    static publicKeyHexFromJwk = async (publicJwk, compressed = true) => {
        const pointX = Buffer.from(publicJwk.x, 'base64url').toString('hex');
        const pointY = Buffer.from(publicJwk.y, 'base64url').toString('hex');
        return compressed ?
            BigInt("0x" + pointY) % 2n === 0n ? "02" + pointX : "03" + pointX
            : "04" + pointX + pointY;
    };
    static _getDidOpsFromModel = async (did) => {
        const didForOps = new ION.DID({ ops: [did] });
        return didForOps;
    };
}
export default IonDid;
