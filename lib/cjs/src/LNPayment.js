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
const bolt11 = __importStar(require("bolt11"));
const bitcoinjs_lib_1 = require("bitcoinjs-lib");
const buffer_1 = require("buffer");
class LNPayment {
    static createInvoice = async (privKey, amount, preimage, btcAddress, paymentSecret) => {
        /*
          There's no "address" in lightning network.
          Pay to lightning node pubic key.
          Only way to receive satoshi is by creating invoice.
        */
        const encoded = bolt11.encode({
            satoshis: amount,
            tags: [
                {
                    tagName: "description",
                    data: "heartbit reward"
                },
                {
                    tagName: "payment_hash",
                    data: bitcoinjs_lib_1.crypto.sha256(buffer_1.Buffer.from(preimage)).toString('hex') // hash of preimage(32 random bytes)
                },
                {
                    tagName: "fallback_address",
                    data: {
                        address: btcAddress
                    }
                },
                {
                    tagName: "payment_secret",
                    data: paymentSecret, // Make sure the amount the sender intends to pay is actually received by the recipient.
                },
                {
                    tagName: 'min_final_cltv_expiry',
                    data: 18 // 18 is default 
                }
            ]
        });
        return bolt11.sign(encoded, privKey);
    };
}
exports.default = LNPayment;
