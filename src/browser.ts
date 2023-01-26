export { ADNLClientWS } from './client-ws'
export { ADNLClient } from './client'

export class ADNLClientTCP {
    constructor (url: string, peerPublicKey: Uint8Array | string) {
        throw new Error('ADNLClientTCP is not available on this platform')
    }
}
