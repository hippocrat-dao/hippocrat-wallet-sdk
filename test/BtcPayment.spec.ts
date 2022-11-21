import * as assert from "assert";
import { describe, it } from 'mocha';
import * as hipocrat from "../index.js";
import BIP32Interface from "../sdk/models/BIP32Interface.js";
import BtcSigner from "../sdk/models/BtcSigner.js";
import BtcNetwork from "../sdk/enums/BtcNetwork.js";
import UTXO from "../sdk/models/UTXO.js";
import BtcReceiver from "../sdk/models/BtcReceiver.js";

describe('get Bitcoin Signer test', () => {
    it('private key & network is crucial to function as btcSigner', async() => {

        const mnemonic : string = await hipocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential : BIP32Interface = await hipocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const privateKey : Buffer = btcAccountPotential.privateKey as Buffer;
        const btcNetwork : BtcNetwork = hipocrat.BtcNetwork.Mainnet;
        
        const btcSigner : BtcSigner = await hipocrat.BtcPayment.getBtcSigner(
            privateKey, btcNetwork)

        assert.strictEqual(
            btcSigner.keyPair.privateKey?.toString('hex'), 
            privateKey.toString('hex'));
        assert.strictEqual(
            btcSigner.payment.network?.messagePrefix, 
            "\x18Bitcoin Signed Message:\n");

    })
})

describe('bitcoin DID registry test', () => {
    it('Tx contains OP_RETURN + 1 satoshi transfer to target address', async() => {

        const mnemonic : string = "영남 진리 실력 생산 여대생 권리 내일 얼핏 졸업 형제 행사 경비";
        const btcAccountPotential : BIP32Interface = await hipocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const privateKey : Buffer = btcAccountPotential.privateKey as Buffer;
        const btcNetwork : BtcNetwork = hipocrat.BtcNetwork.Testnet;
        const btcSigner : BtcSigner = await hipocrat.BtcPayment.getBtcSigner(
            privateKey, btcNetwork);
        const toAddress : string = "tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c";
        const didmsg : string = "certified"

        await hipocrat.BtcPayment.registerDid(btcSigner, [toAddress], didmsg);
            
        const didTxProcessing : UTXO = await hipocrat.BtcRpcNode.getUTXOLatest(
            toAddress, hipocrat.BtcRpcUrl.Testnet
        );

        assert.strictEqual(didTxProcessing.value, 1);
        assert.strictEqual(didTxProcessing.status.confirmed, false);

    })
})

describe('bitcoin transfer transaction test', () => {
    it('Tx contains OP_RETURN + 1 satoshi transfer to target address', async() => {

        const mnemonic : string = "영남 진리 실력 생산 여대생 권리 내일 얼핏 졸업 형제 행사 경비";
        const btcAccountPotential : BIP32Interface = await hipocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const privateKey : Buffer = btcAccountPotential.privateKey as Buffer;
        const btcNetwork : BtcNetwork = hipocrat.BtcNetwork.Testnet;
        const btcSigner : BtcSigner = await hipocrat.BtcPayment.getBtcSigner(
            privateKey, btcNetwork);
        const toAddress : string = "tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c";
        const transferAmount : number = 2;

        await hipocrat.BtcPayment.segWitTransfer(btcSigner, 
            [{
                address: toAddress,
                value: transferAmount
            }] as BtcReceiver[]
            );
            
        const transferTxProcessing : UTXO = await hipocrat.BtcRpcNode.getUTXOLatest(
            toAddress, hipocrat.BtcRpcUrl.Testnet
        );

        assert.strictEqual(transferTxProcessing.value, 2);
        assert.strictEqual(transferTxProcessing.status.confirmed, false);

    })
})
