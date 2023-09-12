declare class HpoPayment {
    static transferHpo: (privKey: string, amount: number, toAddress: string, provider?: any) => Promise<any>;
    static generateHpoAddress: (privKey: string) => Promise<string>;
}
export default HpoPayment;
