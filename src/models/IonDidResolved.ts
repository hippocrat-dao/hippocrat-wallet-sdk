import IonService from "./IonService"

export default interface IonDidResolved {
    '@context': string,
    didDocument: {
        id: string,
        '@context': any[],
        service: IonService[],
        verificationMethod: any[],
        authentication: any[]
    },
    didDocumentMetadata: {
        method: {
            published: boolean,
            recoveryCommitment: string
            updateCommitment: string
        },
        canonicalId: string
    }

}