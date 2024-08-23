import type { Request, Response } from 'express'

type ServerOptionsMock = {
  /** 导出mock 接口文件的地址 */
  mockPath: string
  openApi?: never
}

type ServerOptionsOpenApi = {
  /** openApi json 文件地址 */
  openApi: string
  mockPath?: never
}
export type ServerOptions = (ServerOptionsMock | ServerOptionsOpenApi) & {
  /** 端口号 */
  port?: number
  /** 主机 */
  host?: string
}

export type HTTPMethods_H = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS'
export type HTTPMethods_L = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options'
export type HTTPMethods = HTTPMethods_H | HTTPMethods_L

export type MockApiRecord = {
  url: string
  method: HTTPMethods
  response: Object | ((req: Request) => Object)
}

export type ParsedMockApiRecord = MockApiRecord & {
  method: HTTPMethods_L
  response: (req: Request, res: Response) => void
}

export type RegisterApisReturn = {
  apisLen: number
  serverRoutesStackStartLen: number
}
