import * as lightning from 'lightning';
import LightningAuth from '../src/models/LightningAuth';
declare class LightningPayment {
    static getLNDAdmin: (lndAuth: LightningAuth) => Promise<lightning.AuthenticatedLnd>;
    static getLNDUser: (lndAuth: lightning.LndAuthentication, password: string) => Promise<lightning.AuthenticatedLnd>;
    static getLNDWalletInfo: (lnd: lightning.AuthenticatedLnd) => Promise<lightning.GetWalletInfoResult>;
    static createChannel: (lnd: lightning.AuthenticatedLnd, publicKey: string, channelSize: number) => Promise<lightning.OpenChannelResult>;
    static closeChannel: (lnd: lightning.AuthenticatedLnd, channel: lightning.OpenChannelResult) => Promise<lightning.CloseChannelResult>;
    static requestPayment: (lnd: lightning.AuthenticatedLnd, amount: number) => Promise<lightning.CreateInvoiceResult>;
    static makePayment: (lnd: lightning.AuthenticatedLnd, invoice: lightning.CreateInvoiceResult) => Promise<lightning.PayResult>;
}
export default LightningPayment;
