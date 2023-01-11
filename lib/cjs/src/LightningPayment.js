"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const lightning = __importStar(require("lightning"));
class LightningPayment {
    static getLNDAdmin = async (lndAuth) => {
        const { lnd } = lightning.authenticatedLndGrpc({
            cert: lndAuth.cert,
            macaroon: lndAuth.macaroon,
            socket: lndAuth.socket,
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
exports.default = LightningPayment;
