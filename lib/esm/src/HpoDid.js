import BtcWallet from './BtcWallet.js';
class HpoDid {
    // derive HPO DID account from BTC HD wallet mnemonic
    static createDid = async (mnemonic, purpose = 0, index = 0) => {
        // HpoDid to generate document
        const HpoDid = await BtcWallet.getNonBtcAccountFromMnemonic(mnemonic, purpose, index);
        // HpoDid document
        const HpoDidDocument = {
            '@context': 'https://www.w3.org/ns/did/v1',
            'id': 'did:hpo:' + HpoDid.publicKey.toString('hex'),
            'verificationMethod': [
                {
                    'id': 'did:hpo:' + HpoDid.publicKey.toString('hex'),
                    'type': 'EcdsaSecp256k1VerificationKey2019',
                    'controller': 'did:hpo:' + HpoDid.publicKey.toString('hex'),
                    'publicKeyHex': HpoDid.publicKey.toString('hex')
                }
            ]
        };
        return HpoDidDocument;
    };
}
export default HpoDid;
