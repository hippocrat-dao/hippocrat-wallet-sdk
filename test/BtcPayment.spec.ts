import * as assert from "assert";
import { describe, it } from 'mocha';
import * as hipocrat from "../index.js";

describe('get Bitcoin Signer test', () => {
    it('check private key & network, crucial to function as btcSigner', async() => {
        // Given
        const mnemonic : string = await hipocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential : hipocrat.BtcAccount = await hipocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const btcNetwork : hipocrat.BtcNetwork = hipocrat.BtcNetwork.Mainnet;
        // When
        const btcSigner : hipocrat.BtcSigner = await hipocrat.BtcPayment.getBtcSigner(
            btcAccountPotential, 
            btcNetwork);
        // Then
        assert.strictEqual(
            btcSigner.keyPair.privateKey?.toString('hex'), 
            btcAccountPotential.privateKey?.toString('hex'));
        assert.strictEqual(
            btcSigner.payment.network?.messagePrefix, 
            "\x18Bitcoin Signed Message:\n");

    })
})

describe('bitcoin DID registry test', () => {
    it('Tx contains OP_RETURN + 1 satoshi transfer to target address', async() => {
        // Given
        const mnemonic : string = "영남 진리 실력 생산 여대생 권리 내일 얼핏 졸업 형제 행사 경비";
        const btcAccountPotential : hipocrat.BtcAccount = await hipocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const btcNetwork : hipocrat.BtcNetwork = hipocrat.BtcNetwork.Testnet;
        const btcSigner : hipocrat.BtcSigner = await hipocrat.BtcPayment.getBtcSigner(btcAccountPotential, btcNetwork);
        const toAddress : string = "tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c";
        const didmsg : string = "certified"
        const txFee : hipocrat.TxFee = hipocrat.TxFee.Average;
        // When
        await hipocrat.BtcPayment.registerDid(btcSigner, [toAddress], didmsg, txFee); 
        const didTxProcessing : hipocrat.UTXO = await hipocrat.BtcRpcNode.getUTXOLatest(
            toAddress, 
            hipocrat.BtcRpcUrl.Testnet
        );
        // Then
        assert.strictEqual(didTxProcessing.value, 1);
        assert.strictEqual(didTxProcessing.status.confirmed, false);

    })
})

describe('bitcoin transfer transaction test', () => {
    it('Tx contains target value & toAddress, could transfer to multiple address', async() => {
        // Given
        const mnemonic : string = "영남 진리 실력 생산 여대생 권리 내일 얼핏 졸업 형제 행사 경비";
        const btcAccountPotential : hipocrat.BtcAccount = await hipocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const btcNetwork : hipocrat.BtcNetwork = hipocrat.BtcNetwork.Testnet;
        const btcSigner : hipocrat.BtcSigner = await hipocrat.BtcPayment.getBtcSigner(
            btcAccountPotential, 
            btcNetwork);
        const toAddress : string = "tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c";
        const transferAmount : number = 2;
        const txFee : hipocrat.TxFee = hipocrat.TxFee.Average;
        // When
        await hipocrat.BtcPayment.segWitTransfer(btcSigner, 
            [{
                address: toAddress,
                value: transferAmount
            }] as hipocrat.BtcReceiver[],
            txFee
            );
        const transferTxProcessing : hipocrat.UTXO = await hipocrat.BtcRpcNode.getUTXOLatest(
            toAddress, 
            hipocrat.BtcRpcUrl.Testnet
        );
        // Then
        assert.strictEqual(transferTxProcessing.value, 2);
        assert.strictEqual(transferTxProcessing.status.confirmed, false);

    })
})
