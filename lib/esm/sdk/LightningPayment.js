import * as lightning from 'lightning';
import LightningAuth from './enums/LightningAuth.js';
class LightningPayment {
    static getLNDAdmin = async () => {
        const { lnd } = lightning.authenticatedLndGrpc({
            cert: LightningAuth.TLS,
            macaroon: LightningAuth.Macaroon,
            socket: LightningAuth.Socket,
        });
        // lnd is necessry arg for most of methods
        return lnd;
    };
    static getLNDUser = async (lndAuth, password) => {
        const { lnd: lndWithoutMacaroon } = lightning.unauthenticatedLndGrpc(lndAuth);
        const { seed } = await lightning.createSeed({ lnd: lndWithoutMacaroon });
        const macaroon = await lightning.createWallet({ lnd: lndWithoutMacaroon, seed, password });
        const { lnd } = lightning.authenticatedLndGrpc({
            ...lndAuth,
            macaroon
        });
        // lnd is necessry arg for most of methods
        return lnd;
    };
    static getLNDWalletInfo = async (lnd) => {
        const wallet = await lightning.getWalletInfo({ lnd });
        // wallet of lnd
        return wallet;
    };
    static createChannel = async (lnd, publicKey, channelSize) => {
        /*
          AdminPublicKey = "029a566b8195283ebf34b10ee3e4b687ab618c1a7856a29dd58ba12a63abba7518";
          channelSize must be >= 1000000;
        */
        const channel = await lightning.openChannel({ lnd, local_tokens: channelSize, partner_public_key: publicKey });
        return channel;
    };
    static closeChannel = async (lnd, channel) => {
        const closedChannel = await lightning.closeChannel({
            lnd, ...channel
        });
        return closedChannel;
    };
    static requestPayment = async (lnd, amount) => {
        /*
          there's no "address" in lightning network
          only way to transfer is by creating invoice,
          which expires in 72 hours
        */
        const invoice = await lightning.createInvoice({
            lnd, tokens: amount
        });
        // invoice to show client
        return invoice;
    };
    static makePayment = async (lnd, invoice) => {
        const paymentReceipt = await lightning.pay({ lnd, request: invoice.request });
        return paymentReceipt;
    };
}
export default LightningPayment;
