import { randomBytes, createHash } from 'crypto'

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

    public static parse (data: Buffer): ADNLPacket {
        // TODO: pipe data
        const _size = data.slice(0, 4).readUint32LE(0)
        const bytes = Array.from(data.slice(4, data.byteLength))

        const hash = Buffer.from(bytes.splice(-32))
        const nonce = Buffer.from(bytes.splice(0, 32))
        const payload = Buffer.from(bytes)

        if (!hash.equals(createHash('sha256').update(nonce).update(payload).digest())) {
            throw new Error('Bad packet hash')
        }

        return new ADNLPacket(payload, nonce)
    }
}

export { ADNLPacket }
