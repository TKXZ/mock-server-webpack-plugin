import { genNotice } from './notice'
import type { Server } from 'http'

// 处理服务器错误
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

export function handleUncatchError() {
  process.on('uncaughtException', (error: unknown) => {
    if (error instanceof Error) {
      genNotice['error']('MOCK SERVER', error.message)
    } else {
      genNotice['error']('MOCK SERVER', error as string)
    }
  })
}
