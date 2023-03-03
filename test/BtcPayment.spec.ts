import * as assert from "assert";
import { describe, it } from 'mocha';
import * as hippocrat from "../index.js";

describe('get Bitcoin Signer test', () => {
    it('check private key & network, crucial to function as btcSigner', async() => {
        // Given
        const mnemonic : string = await hippocrat.BtcWallet.generateWalletMnemonic();
        const btcNetwork : hippocrat.BtcNetwork = hippocrat.BtcNetwork.Mainnet; // Mainnet is default, you don't need to specify actually
        const accountIndex : number = 0; // 0 is default, you don't need to specify actually
        const changeIndex : number = 0, addressIndex : number = 0; // 0 is default, you don't need to specify actually
        const addressReuse : boolean = true; // true is default, BUT DO NOT REUSE ADDRESS IF YOU CAN! 
        // When
        const btcSigner : hippocrat.BtcSigner = await hippocrat.BtcPayment.getBtcSigner(
            mnemonic, btcNetwork, accountIndex, changeIndex, addressIndex, addressReuse);
        // Then
        assert.strictEqual(
            btcSigner.addressNext,
            btcSigner.payment.address);
        assert.strictEqual(
            btcSigner.payment.network?.messagePrefix, 
            "\x18Bitcoin Signed Message:\n");
    })
})

describe('write message on bitcoin test', () => {
    it('Tx contains message(could be multiple) to store as OP_RETURN', async() => {
        // Given
        const mnemonic : string = "영남 진리 실력 생산 여대생 권리 내일 얼핏 졸업 형제 행사 경비";
        const btcNetwork : hippocrat.BtcNetwork = hippocrat.BtcNetwork.Testnet; // Mainnet is default, Testnet for test
        const accountIndex : number = 0; // 0 is default, you don't need to specify actually
        const changeIndex : number = 0, addressIndex : number = 0; // 0 is default, you don't need to specify actually
        const addressReuse : boolean = true; // true is default, BUT DO NOT REUSE ADDRESS IF YOU CAN! 
        const btcSigner : hippocrat.BtcSigner = await hippocrat.BtcPayment.getBtcSigner(
            mnemonic, btcNetwork, accountIndex, changeIndex, addressIndex, addressReuse);
        const message : string = "EiANB7qQmnIUenccT9ch1A3da8NfmmVGto5-oMKly8ruGQ" // ION DID can be written directly on BTC!
        const txFee : hippocrat.TxFee = hippocrat.TxFee.Average; // Average is default;
        // When
        await hippocrat.BtcPayment.writeOnBtc(btcSigner, [message], txFee); 
        const didTxProcessing : hippocrat.UTXO = await hippocrat.BtcRpcNode.getUTXOLatest(
            btcSigner.addressNext, 
            hippocrat.BtcRpcUrl.Testnet
        );
        // Then
        assert.strictEqual(didTxProcessing.status.confirmed, false);
    })
})

describe('bitcoin transfer transaction test', () => {
    it('Tx contains target value & toAddress, could transfer to multiple address', async() => {
        // Given
        const mnemonic : string = "영남 진리 실력 생산 여대생 권리 내일 얼핏 졸업 형제 행사 경비";
        const btcNetwork : hippocrat.BtcNetwork = hippocrat.BtcNetwork.Testnet; // Mainnet is default, Testnet for test
        const accountIndex : number = 0; // 0 is default, you don't need to specify actually
        const changeIndex : number = 0, addressIndex : number = 0; // 0 is default, you don't need to specify actually
        const addressReuse : boolean = true; // true is default, BUT DO NOT REUSE ADDRESS IF YOU CAN! 
        const btcSigner : hippocrat.BtcSigner = await hippocrat.BtcPayment.getBtcSigner(
            mnemonic, btcNetwork, accountIndex, changeIndex, addressIndex, addressReuse);
        const toAddress : string = "tb1q8twvf4zp5g0c3yudvl0a3hrktz0k5y3l4l4764";
        const transferAmount : number = 2;
        const txFee : hippocrat.TxFee = hippocrat.TxFee.Average; // Average is default;
        // When
        await hippocrat.BtcPayment.transferBtc(btcSigner, 
            [{
                address: toAddress,
                value: transferAmount
            }] as hippocrat.BtcReceiver[],
            txFee
            );
        const transferTxProcessing : hippocrat.UTXO = await hippocrat.BtcRpcNode.getUTXOLatest(
            toAddress, 
            hippocrat.BtcRpcUrl.Testnet
        );
        // Then
        assert.strictEqual(transferTxProcessing.value, 2);
        assert.strictEqual(transferTxProcessing.status.confirmed, false);
    })
})