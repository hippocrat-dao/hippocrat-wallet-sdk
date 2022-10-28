import eccrypto from 'eccrypto';
import crypto from 'crypto';
import * as keyto from '@trust/keyto';

const ALGO : crypto.CipherGCMTypes = 'aes-256-gcm';

class RareData{
    // convert privateKeyJwk to hex
    static privateKeyHexFromJwk = async (privateKeyJwk : JsonWebKey) 
    : Promise<string> => {
      return keyto
        .from(
          {
            ...privateKeyJwk,
            crv: 'K-256' as string,
          },
          'jwk' as string
        )
        .toString('blk' as string, 'private' as string) as string;
    }
    // convert publicKeyJwk to hex
    static publicKeyHexFromJwk = async (publicKeyJwk: JsonWebKey) 
    : Promise<string> => {
      return keyto
        .from(
          {
            ...publicKeyJwk,
            crv: 'K-256' as string,
          },
          'jwk' as string
        )
        .toString('blk' as string, 'public' as string) as string;
    };
    // ECIES is implemented for data encryption
    static encryptData = async (publicKeyHexTo : string, data : string)
    : Promise<eccrypto.Ecies> => {
        // convert hex key to buffer key
        const publicKeyBuffer : Buffer = Buffer.from(publicKeyHexTo, 'hex');
        // convert data to buffer
        const msg : Buffer = Buffer.from(data);    
        const encryptedData : eccrypto.Ecies = await eccrypto.encrypt(
          publicKeyBuffer, msg);
        return encryptedData;
    }
    // decrypt encrypted data
    static decryptData = async (privateKeyHex : string, encryptedData : eccrypto.Ecies) 
    : Promise<string> => {
        // convert hex key to buffer key
        const privateKeyBuffer : Buffer = Buffer.from(privateKeyHex, 'hex');        
        const decryptedData : Buffer = await eccrypto.decrypt(privateKeyBuffer, encryptedData);
        return decryptedData.toString() as string;
    }
    // encrypt data with ECDH key derived
    static encryptDataShared = async (privateKeyHexA : string, 
      publicKeyHexB: string, data: string)
    : Promise<Buffer> => {
      const sharedKey : Buffer = await eccrypto.derive(
        Buffer.from(privateKeyHexA, 'hex'), 
        Buffer.from(publicKeyHexB, 'hex'));
      // aes-256-gcm is implemented as symmetric key encryption
      const initializationVector = crypto.randomBytes(16);
      const cipher : crypto.CipherGCM = crypto.createCipheriv(ALGO, sharedKey, initializationVector);
      const firstChunk : Buffer = cipher.update(data);
      const secondChunk : Buffer = cipher.final();
      const tag : Buffer = cipher.getAuthTag();
      return Buffer.concat([firstChunk, secondChunk, tag, initializationVector]) as Buffer;
    }
    // decrypt data with ECDH key derived
    static decryptDataShared = async (privateKeyHexB : string, 
      publicKeyHexA: string, encryptedDataShared: Buffer)
    : Promise<string> => {
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
