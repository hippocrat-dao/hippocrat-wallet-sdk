import * as lightning from 'lightning';
import LightningAuth from '../src/models/LightningAuth';

class LightningPayment {

  static getLNDAdmin = async (lndAuth : LightningAuth)
  :Promise<lightning.AuthenticatedLnd> => {
    
    const { lnd } = lightning.authenticatedLndGrpc({
      cert: lndAuth.cert,
      macaroon: lndAuth.macaroon,
      socket: lndAuth.socket,
    } as LightningAuth);
    // lnd is necessry arg for most of methods
    return lnd as lightning.AuthenticatedLnd;
  }

  static getLNDUser = async (
    lndAuth : lightning.LndAuthentication,
    password: string)
  :Promise<lightning.AuthenticatedLnd> => {

    const { lnd: lndWithoutMacaroon } = lightning.unauthenticatedLndGrpc(lndAuth);

    const { seed } = await lightning.createSeed({lnd: lndWithoutMacaroon});

    const macaroon : any = await lightning.createWallet(
      {lnd: lndWithoutMacaroon, seed, password});
    
    const { lnd } =  lightning.authenticatedLndGrpc({
      ...lndAuth,
      macaroon
    })
    // lnd is necessry arg for most of methods
    return lnd as lightning.AuthenticatedLnd;
  }

  static getLNDWalletInfo = async (lnd: lightning.AuthenticatedLnd)
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

  static closeChannel = async(
    lnd: lightning.AuthenticatedLnd,
    channel: lightning.OpenChannelResult)
  : Promise<lightning.CloseChannelResult> => {

    const closedChannel : lightning.CloseChannelResult = await lightning.closeChannel({
      lnd, ...channel
    })

    return closedChannel;
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

export default LightningPayment;