import * as lightning from 'lightning';
import LightningAuth from './enums/LightningAuth.js'

class LightningWallet {

  static authenticateSigner = async ()
  :Promise<any> => {
    const authResult : any = lightning.authenticatedLndGrpc({
      cert: LightningAuth.TLS,
      macaroon: LightningAuth.Macaroon,
      socket: '127.0.0.1:10009',
    });

    return authResult.lnd;
  }

  static getWalletInfo = async (lnd: any)
  :Promise<any> => {
    const wallet : any = await lightning.getWalletInfo({lnd});

    return wallet;
  }

  static createInvoice = async (lnd: any)
  :Promise<any> => {
    const invoice : any = await lightning.createInvoice({lnd});

    return invoice;
  }

  static createChannel =  async (
    lnd:any , publicKey: string, channelSize: number)
  :Promise<any> => {
    /*
      MyPublicKey = "029a566b8195283ebf34b10ee3e4b687ab618c1a7856a29dd58ba12a63abba7518";
      channelSize must be >= 1000000;
    */
    const res =  lightning.openChannel({lnd, local_tokens: channelSize, partner_public_key: publicKey});

    return res;
  }

}

export default LightningWallet;