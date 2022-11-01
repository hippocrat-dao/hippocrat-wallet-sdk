import * as bitcoin from 'bitcoinjs-lib';
import * as ecPair from 'ecpair';

export default interface BtcSigner {
    payment: bitcoin.payments.Payment,
    keyPair: ecPair.ECPairInterface
}