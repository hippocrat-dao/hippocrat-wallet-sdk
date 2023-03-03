import * as assert from "assert";
import { describe, it } from 'mocha';
import * as hippocrat from "../index.js";
describe('get Bitcoin Signer test', () => {
    it('check private key & network, crucial to function as btcSigner', async () => {
        // Given
        const mnemonic = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcNetwork = hippocrat.BtcNetwork.Mainnet; // Mainnet is default, you don't need to specify actually
        const accountIndex = 0; // 0 is default, you don't need to specify actually
        const changeIndex = 0, addressIndex = 0; // 0 is default, you don't need to specify actually
        const addressReuse = true; // true is default, BUT DO NOT REUSE ADDRESS IF YOU CAN! 
        // When
        const btcSigner = await hippocrat.BtcPayment.getBtcSigner(mnemonic, btcNetwork, accountIndex, changeIndex, addressIndex, addressReuse);
        // Then
        assert.strictEqual(btcSigner.addressNext, btcSigner.payment.address);
        assert.strictEqual(btcSigner.payment.network?.messagePrefix, "\x18Bitcoin Signed Message:\n");
    });
});
describe('write message on bitcoin test', () => {
    it('Tx contains message(could be multiple) to store as OP_RETURN', async () => {
        // Given
        const mnemonic = "영남 진리 실력 생산 여대생 권리 내일 얼핏 졸업 형제 행사 경비";
        const btcNetwork = hippocrat.BtcNetwork.Testnet; // Mainnet is default, Testnet for test
        const accountIndex = 0; // 0 is default, you don't need to specify actually
        const changeIndex = 0, addressIndex = 0; // 0 is default, you don't need to specify actually
        const addressReuse = true; // true is default, BUT DO NOT REUSE ADDRESS IF YOU CAN! 
        const btcSigner = await hippocrat.BtcPayment.getBtcSigner(mnemonic, btcNetwork, accountIndex, changeIndex, addressIndex, addressReuse);
        const message = "EiANB7qQmnIUenccT9ch1A3da8NfmmVGto5-oMKly8ruGQ"; // ION DID can be written directly on BTC!
        const txFee = hippocrat.TxFee.Average; // Average is default;
        // When
        await hippocrat.BtcPayment.writeOnBtc(btcSigner, [message], txFee);
        const didTxProcessing = await hippocrat.BtcRpcNode.getUTXOLatest(btcSigner.addressNext, hippocrat.BtcRpcUrl.Testnet);
        // Then
        assert.strictEqual(didTxProcessing.status.confirmed, false);
    });
});
describe('bitcoin transfer transaction test', () => {
    it('Tx contains target value & toAddress, could transfer to multiple address', async () => {
        // Given
        const mnemonic = "영남 진리 실력 생산 여대생 권리 내일 얼핏 졸업 형제 행사 경비";
        const btcNetwork = hippocrat.BtcNetwork.Testnet; // Mainnet is default, Testnet for test
        const accountIndex = 0; // 0 is default, you don't need to specify actually
        const changeIndex = 0, addressIndex = 0; // 0 is default, you don't need to specify actually
        const addressReuse = true; // true is default, BUT DO NOT REUSE ADDRESS IF YOU CAN! 
        const btcSigner = await hippocrat.BtcPayment.getBtcSigner(mnemonic, btcNetwork, accountIndex, changeIndex, addressIndex, addressReuse);
        const toAddress = "tb1q8twvf4zp5g0c3yudvl0a3hrktz0k5y3l4l4764";
        const transferAmount = 2;
        const txFee = hippocrat.TxFee.Average; // Average is default;
        // When
        await hippocrat.BtcPayment.transferBtc(btcSigner, [{
                address: toAddress,
                value: transferAmount
            }], txFee);
        const transferTxProcessing = await hippocrat.BtcRpcNode.getUTXOLatest(toAddress, hippocrat.BtcRpcUrl.Testnet);
        // Then
        assert.strictEqual(transferTxProcessing.value, 2);
        assert.strictEqual(transferTxProcessing.status.confirmed, false);
    });
});
