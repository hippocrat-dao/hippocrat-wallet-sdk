import eccrypto from 'eccrypto';
import crypto from 'crypto';
import ECIES from './models/ECIES';

const ALGO : crypto.CipherGCMTypes = 'aes-256-gcm';

class RareData{
    // ECIES is implemented for data encryption
    static encryptData = async (publicKeyHexTo : string, data : string)
    : Promise<ECIES> => {
        // convert hex key to buffer key
        const publicKeyBuffer : Buffer = Buffer.from(publicKeyHexTo, 'hex');
        // convert data to buffer
        const msg : Buffer = Buffer.from(data);    
        const encryptedData : ECIES = await eccrypto.encrypt(
          publicKeyBuffer, msg);
        return encryptedData;
    }
    // decrypt encrypted data
    static decryptData = async (privateKeyHex : string, encryptedData : ECIES) 
    : Promise<string> => {
        // convert hex key to buffer key
        const privateKeyBuffer : Buffer = Buffer.from(privateKeyHex, 'hex');        
        const decryptedData : Buffer = await eccrypto.decrypt(privateKeyBuffer, encryptedData);
        return decryptedData.toString() as string;
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
