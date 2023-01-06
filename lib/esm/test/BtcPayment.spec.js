import * as assert from "assert";
import { describe, it } from 'mocha';
import * as hippocrat from "../index.js";
describe('get Bitcoin Signer test', () => {
    it('check private key & network, crucial to function as btcSigner', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcAccountPotential = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const btcNetwork = hippocrat.BtcNetwork.Mainnet;
        // When
        const btcSigner = await hippocrat.BtcPayment.getBtcSigner(btcAccountPotential, btcNetwork);
        // Then
        assert.strictEqual(btcSigner.keyPair.privateKey?.toString('hex'), btcAccountPotential.privateKey?.toString('hex'));
        assert.strictEqual(btcSigner.payment.network?.messagePrefix, "\x18Bitcoin Signed Message:\n");
    });
});
describe('bitcoin DID registry test', () => {
    it('Tx contains OP_RETURN + 1 satoshi transfer to target address', async () => {
        // Given
        const mnemonic = "영남 진리 실력 생산 여대생 권리 내일 얼핏 졸업 형제 행사 경비";
        const btcAccountPotential = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const btcNetwork = hippocrat.BtcNetwork.Testnet;
        const btcSigner = await hippocrat.BtcPayment.getBtcSigner(btcAccountPotential, btcNetwork);
        const toAddress = "tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c";
        const didmsg = "certified";
        const txFee = hippocrat.TxFee.Average;
        // When
        await hippocrat.BtcPayment.registerDid(btcSigner, [toAddress], didmsg, txFee);
        const didTxProcessing = await hippocrat.BtcRpcNode.getUTXOLatest(toAddress, hippocrat.BtcRpcUrl.Testnet);
        // Then
        assert.strictEqual(didTxProcessing.value, 1);
        assert.strictEqual(didTxProcessing.status.confirmed, false);
    });
});
describe('bitcoin transfer transaction test', () => {
    it('Tx contains target value & toAddress, could transfer to multiple address', async () => {
        // Given
        const mnemonic = "영남 진리 실력 생산 여대생 권리 내일 얼핏 졸업 형제 행사 경비";
        const btcAccountPotential = await hippocrat.BtcWallet.getChildFromMnemonic(mnemonic);
        const btcNetwork = hippocrat.BtcNetwork.Testnet;
        const btcSigner = await hippocrat.BtcPayment.getBtcSigner(btcAccountPotential, btcNetwork);
        const toAddress = "tb1qyk6e26ey6v0qc6uaxl9h3ky86uek3qhwx7pq3c";
        const transferAmount = 2;
        const txFee = hippocrat.TxFee.Average;
        // When
        await hippocrat.BtcPayment.segWitTransfer(btcSigner, [{
                address: toAddress,
                value: transferAmount
            }], txFee);
        const transferTxProcessing = await hippocrat.BtcRpcNode.getUTXOLatest(toAddress, hippocrat.BtcRpcUrl.Testnet);
        // Then
        assert.strictEqual(transferTxProcessing.value, 2);
        assert.strictEqual(transferTxProcessing.status.confirmed, false);
    });
});
