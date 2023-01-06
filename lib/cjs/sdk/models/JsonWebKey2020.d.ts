export default interface JsonWebKey2020 {
    id: string;
    type: 'JsonWebKey2020';
    controller: string;
    publicKeyJwk: JsonWebKey;
    privateKeyJwk?: JsonWebKey;
}
