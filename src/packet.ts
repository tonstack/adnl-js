import { randomBytes, createHash } from 'crypto'

const PACKET_MIN_SIZE = 4 + 32 + 32 // size + nonce + hash

class ADNLPacket {
    private _payload: Buffer

    private _nonce: Buffer

    constructor (payload: Buffer, nonce: Buffer = Buffer.from(randomBytes(32))) {
        this._payload = payload
        this._nonce = nonce
    }

    public get payload (): Buffer {
        return this._payload
    }

    public get nonce (): Buffer {
        return this._nonce
    }

    public get hash (): Buffer {
        return createHash('sha256')
            .update(this.nonce)
            .update(this.payload)
            .digest()
    }

    public get size (): Buffer {
        const buffer = new ArrayBuffer(4)
        const view = new DataView(buffer)

        view.setUint32(0, this._payload.length + 32 + 32, true)

        return Buffer.from(view.buffer)
    }

    public get data (): Buffer {
        return Buffer.concat([ this.size, this.nonce, this.payload, this.hash ])
    }

    public get length (): number {
        return 4 + 32 + this._payload.length + 32
    }

    public static parse (data: Buffer): ADNLPacket {
        const packet = { cursor: 0, data }

        if (packet.data.byteLength < 4) {
            return null
        }

        const size = packet.data.slice(0, packet.cursor += 4).readUint32LE(0)

        if (packet.data.byteLength - 4 < size) {
            return null
        }

        const nonce = packet.data.slice(packet.cursor, packet.cursor += 32)
        const payload = packet.data.slice(packet.cursor, packet.cursor += (size - (32 + 32)))
        const hash = packet.data.slice(packet.cursor, packet.cursor += 32)

        if (!hash.equals(createHash('sha256').update(nonce).update(payload).digest())) {
            throw new Error('ADNLPacket: Bad packet hash.')
        }

        return new ADNLPacket(payload, nonce)
    }
}

export {
    ADNLPacket,
    PACKET_MIN_SIZE
}
