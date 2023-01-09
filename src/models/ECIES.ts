export default interface ECIES {
    iv: Buffer;
    ephemPublicKey: Buffer;
    ciphertext: Buffer;
    mac: Buffer;
}