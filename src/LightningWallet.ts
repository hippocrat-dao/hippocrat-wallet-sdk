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

}

export default LightningWallet;