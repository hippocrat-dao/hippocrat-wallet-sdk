import BtcWallet from './BtcWallet';
import BtcAccount from './models/BtcAccount';
import HpoDidModel from './models/HpoDidModel';

class HpoDid {
  // derive HPO DID account from BTC HD wallet mnemonic
  static createDid = async (
    mnemonic: string,
    purpose = 0,
    index = 0,
  ): Promise<HpoDidModel> => {
    // HpoDid to generate document
    const HpoDid: BtcAccount = await BtcWallet.getNonBtcAccountFromMnemonic(
      mnemonic,
      purpose,
      index,
    );
    // HpoDid document
    const HpoDidDocument: HpoDidModel = {
      '@context': 'https://www.w3.org/ns/did/v1',
      id: 'did:hpo:' + HpoDid.publicKey.toString('hex'),
      verificationMethod: [
        {
          id: 'did:hpo:' + HpoDid.publicKey.toString('hex'),
          type: 'EcdsaSecp256k1VerificationKey2019' as const,
          controller: 'did:hpo:' + HpoDid.publicKey.toString('hex'),
          publicKeyHex: HpoDid.publicKey.toString('hex'),
        },
      ],
    };
    return HpoDidDocument;
  };
}

export default HpoDid;
