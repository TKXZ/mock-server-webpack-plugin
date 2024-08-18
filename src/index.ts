import type { Compiler } from 'webpack'
import type { ServerOptions } from './types'
import { PLUGIN_NAME } from '@/constants'
import { genNotice } from '@/utils/notice'
import { checkPort, checkMockPath } from '@/utils/check'
import server from '@/server/server'
import run from '@/server/core'

class MockServerWebpackPlugin {
  private readonly port: number
  private readonly host: string
  private readonly mockPath: string

  constructor(options: ServerOptions) {
    if (options != null && typeof options === 'object') {
      const { port, host = 'localhost', mockPath } = options

      checkMockPath(mockPath)
      checkPort(port)

      this.port = port
      this.host = host
      this.mockPath = mockPath
    } else {
      console.log(genNotice['error']('MOCK SERVER ERROR', 'Invalid options'))
      throw new Error('Invalid options')
    }
  }

  apply(compiler: Compiler) {
    compiler.hooks.afterPlugins.tap(PLUGIN_NAME, () => {
      run(server, {
        port: this.port,
        host: this.host,
        mockPath: this.mockPath,
      })
    })
  }
}

export default MockServerWebpackPlugin
