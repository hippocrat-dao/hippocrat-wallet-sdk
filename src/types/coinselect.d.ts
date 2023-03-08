declare module "coinselect" {

  interface Output {
    address: string;
    value: number;
  }

  interface CoinSelectResponse<T> {
    inputs: T[];
    outputs: Output[];
    fee: number;
  }

  function coinselect<T>(
    utxos: T[],
    outputs: Output[],
    feeRate: number
  ): CoinSelectResponse<T>;

  export default coinselect;
}
