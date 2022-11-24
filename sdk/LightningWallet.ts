import * as lightning from 'lightning';
import * as bip39 from 'bip39';
import LightningAuth from './enums/LightningAuth.js'

class LightningWallet {

  static getLightningRpcNodeAdmin = async ()
  :Promise<lightning.AuthenticatedLnd> => {
    
    const { lnd } = lightning.authenticatedLndGrpc({
      cert: LightningAuth.TLS,
      macaroon: LightningAuth.Macaroon,
      socket: LightningAuth.Socket,
    });
    // lnd is necessry arg for most of methods
    return lnd as lightning.AuthenticatedLnd;
  }

  static getLightningRpcNodeForUser = async (
    lndAuth : lightning.LndAuthentication,
    mnemonic : string,
    password: string)
  :Promise<lightning.AuthenticatedLnd> => {

    const { lnd: lndWithoutMacaroon } = lightning.unauthenticatedLndGrpc(lndAuth);

    const seed : string = bip39.mnemonicToSeedSync(mnemonic).toString('hex');

    const { macaroon } = await lightning.createWallet(
      {lnd: lndWithoutMacaroon, seed, password});

    const { lnd } =  lightning.authenticatedLndGrpc({
      ...lndAuth,
      macaroon
    })
    // lnd is necessry arg for most of methods
    return lnd as lightning.AuthenticatedLnd;
  }

  static getNodeWalletInfo = async (lnd: lightning.AuthenticatedLnd)
  :Promise<lightning.GetWalletInfoResult> => {
    const wallet : lightning.GetWalletInfoResult = await lightning.getWalletInfo({lnd});
    // wallet of lnd
    return wallet;
  }

  static createChannel =  async (
    lnd: lightning.AuthenticatedLnd, publicKey: string, channelSize: number)
  :Promise<lightning.OpenChannelResult> => {
    /*
      AdminPublicKey = "029a566b8195283ebf34b10ee3e4b687ab618c1a7856a29dd58ba12a63abba7518";
      channelSize must be >= 1000000;
    */
    const channel : lightning.OpenChannelResult = await lightning.openChannel(
      {lnd, local_tokens: channelSize, partner_public_key: publicKey});

    return channel;
  }


  static requestPayment = async (
    lnd: lightning.AuthenticatedLnd,
    amount: number)
  :Promise<lightning.CreateInvoiceResult> => {
    /*
      there's no "address" in lightning network
      only way to transfer is by creating invoice,
      which expires in 72 hours
    */
    const invoice : lightning.CreateInvoiceResult = await lightning.createInvoice({
      lnd, tokens: amount});
    // invoice to show client
    return invoice;
  }

  static makePayment = async (
    lnd: lightning.AuthenticatedLnd,
    invoice: lightning.CreateInvoiceResult)
  :Promise<lightning.PayResult> => {
    
    const paymentReceipt : lightning.PayResult = await lightning.pay({lnd, request: invoice.request});
    
    return paymentReceipt;
  }

}

export default LightningWallet;