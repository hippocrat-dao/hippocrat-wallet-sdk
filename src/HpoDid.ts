import BtcWallet from './BtcWallet.js';
import BtcAccount from './models/BtcAccount.js';
import HpoDidModel from './models/HpoDidModel.js';

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
		const publicKeyHex: string = HpoDid.publicKey.toString('hex');
		// HpoDid document
		const HpoDidDocument: HpoDidModel = {
			'@context': 'https://www.w3.org/ns/did/v1',
			id: 'did:hpo:' + publicKeyHex,
			verificationMethod: [
				{
					id: 'did:hpo:' + publicKeyHex,
					type: 'EcdsaSecp256k1VerificationKey2019' as const,
					controller: 'did:hpo:' + publicKeyHex,
					publicKeyHex,
				},
			],
		};
		return HpoDidDocument;
	};
}

export default HpoDid;
