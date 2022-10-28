import BtcWallet from '../dist/BtcWallet.js'
import BtcRpcNode from '../dist/BtcRpcNode.js'
import BtcPayment from '../dist/BtcPayment.js'
import IonDid from '../dist/IonDid.js'
import RareData from '../dist/RareData.js'

// BtcWalletLog
const mnemonic = await BtcWallet.generateWalletMnemonic();
const child = await BtcWallet.getChildFromMnemonic(mnemonic);
const grandChild = await BtcWallet.getChildFromAccount(child);
const btcAddress =  await BtcWallet.generateBtcAccount(child);
const encrpytedMnemonic = await BtcWallet.generateEncryptedVault(mnemonic, "비밀번호 000!");
const decryptedMnemonic = await BtcWallet.decryptVault(encrpytedMnemonic, "비밀번호 000!")
console.log(mnemonic);
console.log(child);
console.log(grandChild);
console.log(btcAddress);
console.log(encrpytedMnemonic);
console.log(decryptedMnemonic);

// RareDataLog
const data = "rare data!";
const encrpytedData = await RareData.encryptData(grandChild.publicKey, data);
const decryptedData = await RareData.decryptData(grandChild.privateKey, encrpytedData);
console.log(data);
console.log(encrpytedData);
console.log(decryptedData);

const sharedData = "shared rare data!"
const encrpytedDataShared = await RareData.encryptDataShared(child.privateKey, 
    grandChild.publicKey, sharedData);
const decryptedDataShared = await RareData.decryptDataShared(grandChild.privateKey, 
    child.publicKey, encrpytedDataShared)
console.log(encrpytedDataShared);
console.log(decryptedDataShared);

// BtcRpcNodeLog
const utxo = await BtcRpcNode.getUTXOLatest("tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c");
const utxoList = await BtcRpcNode.getUTXOList("tb1qsww2x6w2mjmdfv3lcr6gxzxfalykrxxsqprpp7");
console.log(utxo);
console.log(utxoList);

// BtcPaymentLog
const mnemonicFixed = "영남 진리 실력 생산 여대생 권리 내일 얼핏 졸업 형제 행사 경비"
const childFixed = await BtcWallet.getChildFromMnemonic(mnemonicFixed);
const btcSigner = await BtcPayment.getBtcSigner(childFixed.privateKey);
const btcDidTx =  await BtcPayment.createDid(btcSigner, "tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c", "go-human-go");
console.log(btcSigner);
console.log(btcDidTx);

// IonDidLog
const jwk = await IonDid.generateKeyPair(grandChild);
const ion = await IonDid.createDid(jwk, [
    {
        id: "tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c",
        type: "humanscape patient wallet",
        serviceEndpoint: "https://blockstream.info/testnet/address/tb1qsww2x6w2mjmdfv3lcr6gxzxfalykrxxsqprpp7"
    },
    {
        id: "tb1qsww2x6w2mjmdfv3lcr6gxzxfalykrxxsqprpp7",
        type: "humanscape admin wallet",
        serviceEndpoint: "https://blockstream.info/testnet/address/tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c"
    },
    {
        id: "humanscape0patient0id",
        type: "humanscape patient data",
        serviceEndpoint: "https://ipfs.io/ipfs/bafybeialzikkahbkmyjegm5tgus3m4izqntr647pf7uqvhglossdop5fau"
    }
]);
const ionUriShort = await IonDid.getDidUriShort(ion);
const ionUriLong = await IonDid.getDidUriLong(ion);
const ionPow = await IonDid.anchorRequest(ion);
const didToBePublished = await IonDid.getDidResolved(ionUriLong);
const didPublished = await IonDid.getDidResolved("did:ion:EiCawlIuzvfHIW-mPt8mk1NmJGnJILgzrjJ3YYy3VtcDLw");

console.log(jwk);
console.log(ion);
console.log(ionUriShort);
console.log(ionUriLong);
console.log(didToBePublished);
console.log(ionPow);
console.log(didPublished);