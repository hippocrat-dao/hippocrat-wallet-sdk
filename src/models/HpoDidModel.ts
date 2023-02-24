export default interface HpoDidModel {
    '@context': string,
    id: string,
    verificationMethod: {
        id: string,
        type: 'EcdsaSecp256k1VerificationKey2019',
        controller: string,
        publicKeyHex: string
    }[]
}