import BtcSigner from './models/BtcSigner';
import BtcReceiver from './models/BtcReceiver';
import BtcNetwork from './enums/BtcNetwork';
import TxFee from './enums/TxFee';
declare class BtcPayment {
    static getBtcSigner: (mnemonic: string, btcNetwork?: BtcNetwork, accountIndex?: number, changeIndex?: number, addressIndex?: number, addressReuse?: boolean) => Promise<BtcSigner>;
    static writeOnBtc: (signer: BtcSigner, messageList: string[], txFee?: TxFee) => Promise<string>;
    static transferBtc: (signer: BtcSigner, receiverList: BtcReceiver[], txFee?: TxFee) => Promise<string>;
    private static _utxoOptimizer;
    private static _signAndBroadcastTx;
    private static _getSignerNetwork;
}
export default BtcPayment;
