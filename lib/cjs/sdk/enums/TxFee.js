"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TxFee;
(function (TxFee) {
    TxFee[TxFee["High"] = 15] = "High";
    TxFee[TxFee["Average"] = 10] = "Average";
    TxFee[TxFee["Low"] = 5] = "Low";
})(TxFee || (TxFee = {}));
exports.default = TxFee; // satoshi per bytes
