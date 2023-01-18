import eccrypto from 'eccrypto';
import * as crypto from 'crypto-browserify';
import {Buffer} from 'buffer';

const ALGO : crypto.CipherGCMTypes = 'aes-256-gcm';

class RareData{
    // ECIES is implemented for data encryption
    static encryptData = async (toPubKeyHex : string, data : string)
    : Promise<string> => {
        // convert hex key to buffer key
        const toPubKeyBuffer : Buffer = Buffer.from(toPubKeyHex, 'hex');
        // convert data to buffer
        const fromAlice : crypto.ECDH = await crypto.createECDH('secp256k1');
        const fromPubKey : Buffer =  await fromAlice.generateKeys();
        const ecdhKey : Buffer = await fromAlice.computeSecret(toPubKeyBuffer);
        // aes-256-gcm is implemented as symmetric key encryption
        const initializationVector = crypto.randomBytes(16);
        const cipher : crypto.CipherGCM = crypto.createCipheriv(ALGO, ecdhKey, initializationVector);
        const firstChunk : Buffer = cipher.update(data);
        const secondChunk : Buffer = cipher.final();
        const tag : Buffer = cipher.getAuthTag();
        return Buffer
              .concat([firstChunk, secondChunk, tag, initializationVector, fromPubKey])
              .toString('base64');
    }
    // decrypt encrypted data
    static decryptData = async (privKeyHex : string, encryptedData : string) 
    : Promise<string> => {
        // covert string to buffer for encryptedData
        const encryptedDataShared : Buffer = Buffer.from(encryptedData, 'base64');
        // convert hex key to buffer key
        const privKeyBuffer : Buffer = Buffer.from(privKeyHex, 'hex'); 
        // get fromPubKey and compute ecdh key
        const fromPubKey : Buffer = Buffer.from(encryptedDataShared.slice(
          encryptedDataShared.length - 65)); 
        const toBob : crypto.ECDH = await crypto.createECDH('secp256k1');
        toBob.setPrivateKey(privKeyBuffer);
        const ecdhKey : Buffer = await toBob.computeSecret(fromPubKey);
        // aes-256-gcm is implemented as symmetric key decryption
        const initializationVector : Buffer = encryptedDataShared.slice(
          encryptedDataShared.length-81, encryptedDataShared.length - 65);
        const tag : Buffer = encryptedDataShared.slice(encryptedDataShared.length-97, encryptedDataShared.length-81)
        const encryptedMessage : Buffer = encryptedDataShared.slice(0, encryptedDataShared.length-97);
        const decipher : crypto.DecipherGCM = crypto.createDecipheriv(ALGO, ecdhKey, initializationVector);
        decipher.setAuthTag(tag);
        const firstChunk : Buffer = decipher.update(encryptedMessage);
        const secondChunk : Buffer = decipher.final();
        return Buffer.concat([firstChunk, secondChunk]).toString() as string;
    }
    // encrypt data with cipher's fixed private key
    static encryptDataShared = async (privateKeyHexA : string, 
      publicKeyHexB: string, data: string)
    : Promise<string> => {
      const sharedKey : Buffer = await eccrypto.derive(
        Buffer.from(privateKeyHexA, 'hex'), 
        Buffer.from(publicKeyHexB, 'hex'));
      // aes-256-gcm is implemented as symmetric key encryption
      const initializationVector = crypto.randomBytes(16);
      const cipher : crypto.CipherGCM = crypto.createCipheriv(ALGO, sharedKey, initializationVector);
      const firstChunk : Buffer = cipher.update(data);
      const secondChunk : Buffer = cipher.final();
      const tag : Buffer = cipher.getAuthTag();
      return Buffer
            .concat([firstChunk, secondChunk, tag, initializationVector])
            .toString('base64');
    }
    // decrypt data with cipher's fixed public key
    static decryptDataShared = async (privateKeyHexB : string, 
      publicKeyHexA: string, encryptedDataSharedStr: string)
    : Promise<string> => {
      const encryptedDataShared : Buffer = Buffer.from(encryptedDataSharedStr, 'base64');
      const sharedKey : Buffer = await eccrypto.derive(
        Buffer.from(privateKeyHexB, 'hex'), 
        Buffer.from(publicKeyHexA, 'hex'));
      // aes-256-gcm is implemented as symmetric key decryption
      const initializationVector : Buffer = encryptedDataShared.slice(encryptedDataShared.length-16);
      const tag : Buffer = encryptedDataShared.slice(encryptedDataShared.length-32, encryptedDataShared.length-16)
      const encryptedData : Buffer = encryptedDataShared.slice(0, encryptedDataShared.length-32);
      const decipher : crypto.DecipherGCM = crypto.createDecipheriv(ALGO, sharedKey, initializationVector);
      decipher.setAuthTag(tag);
      const firstChunk : Buffer = decipher.update(encryptedData);
      const secondChunk : Buffer = decipher.final();
      return Buffer.concat([firstChunk, secondChunk]).toString() as string;
    }
}

export default RareData;
