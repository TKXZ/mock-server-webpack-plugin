import type { Compiler } from 'webpack'
import type { ServerOptions } from './types'
import { PLUGIN_NAME } from '@/constants'
import { genNotice } from '@/utils/notice'
import { checkPluginOptions } from '@/utils/check'
import { handleUncatchError } from '@/utils/error-handler'
import server from '@/server/server'
import run from '@/server/core'

class MockServerWebpackPlugin {
  private readonly options: ServerOptions | null = null

  constructor(options: ServerOptions) {
    handleUncatchError()
    try {
      this.options = { port: 3636, host: 'localhost', ...options }
      checkPluginOptions(this.options)
    } catch (err) {
      console.log(genNotice['error']('MOCK SERVER ERROR', err as string))
    }
  }

  apply(compiler: Compiler) {
    compiler.hooks.afterPlugins.tap(PLUGIN_NAME, async () => {
      run(server, this.options)
    })
  }
}

export default MockServerWebpackPlugin
