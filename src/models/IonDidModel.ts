import IonService from "./IonService"

export default interface IonDidModel {
    operation: string,
    content: {
        publicKeys: {
            id: string,
            publicKeyJwk : JsonWebKey,
            purposes: string[],
            type: 'EcdsaSecp256k1VerificationKey2019'
        } [],
        services: IonService[],
    },
    recovery: {
        privateJwk: JsonWebKey,
        publicJwk: JsonWebKey
    },
    update: {
        privateJwk: JsonWebKey,
        publicJwk: JsonWebKey
    }
}