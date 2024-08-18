import Mock from 'mockjs'
import chokidar from 'chokidar'
import type { MockApiRecord, ParsedMockApiRecord, HTTPMethods_L, RegisterApisReturn } from '@/types'
import type { Express, Request, Response } from 'express'
import { genNotice } from '@/utils/notice'
import { handleServerError } from '@/utils/error-handler'

/**
 * 获取接口
 * @param mockPath
 * @param prefix
 * @returns
 */
function getApis(mockPath: string, prefix: string = ''): MockApiRecord[] {
  const apis = require(mockPath)
  if (prefix && typeof prefix === 'string') {
    return apis.map((item: MockApiRecord) => {
      item.url = prefix + item.url
      return item
    })
  } else {
    return apis
  }
}

/**
 * 注册接口
 * @param server
 * @param apis
 * @returns
 */
function registerApis(server: Express, apis: MockApiRecord[]): RegisterApisReturn {
  let serverRoutesStackLen: number = 0
  const api = apis
  const parsedApis = api.map((api) => parseApi(api))
  parsedApis.forEach((api) => {
    server[api.method](api.url, api.response)
    serverRoutesStackLen = server._router.stack.length
  })

  const apisLen = parsedApis.length

  return {
    apisLen,
    serverRoutesStackStartLen: serverRoutesStackLen - apisLen,
  }
}

/**
 * 消除旧接口缓存
 * @param mockPath
 */
function unregisterMocks(mockPath: string) {
  Object.keys(require.cache).forEach((item) => {
    if (item.includes(mockPath)) {
      delete require.cache[require.resolve(item)]
    }
  })
}

function parseApi(api: MockApiRecord): ParsedMockApiRecord {
  return {
    url: api.url,
    method: (api.method.toLowerCase() as HTTPMethods_L) || 'get',
    response: (req: Request, res: Response) => {
      console.log(genNotice['info']('MOCK', `${api.method.toUpperCase()} ${api.url}`))
      res.json(typeof api.response === 'function' ? Mock.mock(api.response(req)) : Mock.mock(api.response))
    },
  }
}

/**
 * 热更新接口
 * @param mockPath
 * @param server
 * @param serverRoutesStackStartLen
 * @param apisLen
 */
function watchToReload(mockPath: string, server: Express, serverRoutesStackStartLen: number, apisLen: number) {
  let __apisLen: number = apisLen
  let __serverRoutesStackStartLen: number = serverRoutesStackStartLen
  chokidar.watch(mockPath, { ignoreInitial: true }).on('all', (event, path) => {
    if (event === 'change' || event === 'add') {
      try {
        // 消除旧的路由栈
        server._router.stack.splice(__serverRoutesStackStartLen, __apisLen)

        unregisterMocks(mockPath)

        // 重新注册新mock接口
        const apis = getApis(mockPath)
        const mockRes = registerApis(server, apis)
        apisLen = mockRes.apisLen
        serverRoutesStackStartLen = mockRes.serverRoutesStackStartLen

        console.log(genNotice['info']('MOCK SERVER UPDATE', path))
      } catch (error) {
        console.log(genNotice['error']('MOCK SERVER ERROR', 'Mock server failed to update'))
      }
    }
  })
}

export default function (server: Express, options: any): void {
  try {
    const { prefix, port, host, mockPath } = options

    const apis = getApis(mockPath, prefix)
    const { apisLen, serverRoutesStackStartLen } = registerApis(server, apis)

    const mockServer = server.listen(port, host, () => {
      console.log(genNotice['success']('MOCK SERVER', `Server is running at http://${host}:${port}`))
    })
    handleServerError(mockServer)
    watchToReload(mockPath, server, serverRoutesStackStartLen, apisLen)
  } catch (error) {
    console.log(genNotice['error']('MOCK SERVER', 'Mock server failed to start'))
  }
}
