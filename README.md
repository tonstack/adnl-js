## adnl

[![npm](https://img.shields.io/npm/v/adnl)](https://www.npmjs.com/package/adnl) ![GitHub top language](https://img.shields.io/github/languages/top/tonstack/adnl-js)

ADNL JavaScript implementation.
> :warning: Work in progress, API can (and most likely will) be changed! This is not production ready version yet.

## How to install
```
npm i adnl
```

## Simple usage
```typescript
import { ADNLClient } from 'adnl'

const ADNL_HOST = '127.0.0.1'
const ADNL_PORT = 1337
const ADNL_PUB_KEY = 'hex/base64/buffer'
const URL = `tcp://${ADNL_HOST}:${ADNL_PORT}` // Also can be used as WebSocket<->TCP proxy like: `wss://proxy.example.com/?dest_host=${ADNL_HOST}:${ADNL_PORT}`

const TL_GETTIME = '7af98bb435263e6c95d6fecb497dfd0aa5f031e7d412986b5ce720496db512052e8f2d100cdf068c7904345aad16000000000000'
const TL_PARSE_GETTIME = (data: Buffer) => {
    const unix = data.slice(data.byteLength - 7, data.byteLength - 3).readUint32LE(0)

    return new Date(unix * 1000).toString()
}

const client = new ADNLClient(URL, ADNL_PUB_KEY)
    .on('connect', () => console.log('on connect'))
    .on('close', () => console.log('on close'))
    .on('data', (data: Buffer) => console.log('on data:', TL_PARSE_GETTIME(data)))
    .on('error', (error: Error) => console.log('on error:', error))
    .on('ready', () => {
        console.log('on ready')

        let counter = 0
        let interval = setInterval(() => {
            client.write(Buffer.from(TL_GETTIME, 'hex'))
        
            if (++counter === 5) {
                clearInterval(interval)
                client.end()
            }
        }, 3000)
    })

await client.connect()
```

## License

MIT License
