import BOLT11 from './models/BOLT11';
declare class LNPayment {
    static createInvoice: (privKey: string, amount: number, preimage: string, btcAddress: string, paymentSecret: string) => Promise<BOLT11>;
}
export default LNPayment;
