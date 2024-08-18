import { genNotice } from './notice'
import type { Server } from 'http'

export function handleServerError(server: Server) {
  server.on('error', (err: any = {}) => {
    const { port } = err
    if (err.code === 'EADDRINUSE') {
      console.log(genNotice['error']('MOCK SERVER', `Port ${port} is already in use. Please try a different port.`))
    } else {
      console.log(genNotice['error']('MOCK SERVER', err))
    }
  })
}
