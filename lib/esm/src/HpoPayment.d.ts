declare class HpoPayment {
    static transferHpo: (privKey: string, amount: number, toAddress: string, provider?: any) => Promise<any>;
    static generateHpoAddress: (publicKey: string) => Promise<string>;
    static getHpoBalance: (address: string, provider?: any) => Promise<string>;
    static transferEth: (privKey: string, amount: number, toAddress: string, provider?: any) => Promise<any>;
    static getEthBalance: (address: string, provider?: any) => Promise<string>;
}
export default HpoPayment;
