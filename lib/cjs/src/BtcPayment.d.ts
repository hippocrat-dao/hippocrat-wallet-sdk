import BtcSigner from './models/BtcSigner.js';
import BtcReceiver from './models/BtcReceiver.js';
import BtcNetwork from './enums/BtcNetwork.js';
import BtcAccount from './models/BtcAccount.js';
import TxFee from './enums/TxFee.js';
declare class BtcPayment {
    static getBtcSigner: (btcAccountSigner: BtcAccount, btcNetwork: BtcNetwork) => Promise<BtcSigner>;
    static registerDid: (signer: BtcSigner, toAddressList: string[], didmsg: string, txFee: TxFee) => Promise<string>;
    static segWitTransfer: (signer: BtcSigner, receiverList: BtcReceiver[], txFee: TxFee) => Promise<string>;
    private static _utxoOptimizer;
    private static _signAndBroadcastTx;
    private static _getSignerNetwork;
}
export default BtcPayment;
