import type { Compiler } from 'webpack'
import type { ServerOptions } from './types'
import { PLUGIN_NAME } from '@/constants'
import { genNotice } from '@/utils/notice'
import { checkPort, checkMockPath } from '@/utils/check'
import server from '@/server/server'
import run from '@/server/core'

import { getDtos, getOSAJSON, getRoutes } from '@/utils/parse-openapi'

class MockServerWebpackPlugin {
  private readonly options: ServerOptions

  constructor(options: ServerOptions) {
    if (options != null && typeof options === 'object') {
      this.options = { port: 3636, host: 'localhost', ...options }
    } else {
      console.log(genNotice['error']('MOCK SERVER ERROR', 'Invalid options'))
      throw new Error('Invalid options')
    }
  }

  apply(compiler: Compiler) {
    compiler.hooks.afterPlugins.tap(PLUGIN_NAME, async () => {
      const res = await getOSAJSON(this.options.openApi ?? '')
      const { port, host, mockPath } = this.options
      run(server, {
        port,
        host,
        mockPath,
      })
    })
  }
}

export default MockServerWebpackPlugin
