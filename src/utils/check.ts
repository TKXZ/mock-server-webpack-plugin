import { ServerOptions } from '@/types'
import { genNotice } from './notice'
import fs from 'node:fs'
import _ from 'lodash'

// 检查数据类型
const check = {
  isObject: (data: any) => {
    if (!_.isObject(data)) {
      console.log(genNotice['error']('MOCK ERROR', `${data} is not an object`))
      throw new Error('Invalid data type')
    }
    return data
  },
  interger: (data: any) => {
    if (!Number.isInteger(data)) {
      console.log(genNotice['error']('MOCK ERROR', `${data} is not an integer`))
      throw new Error('Invalid data type')
    }
    return
  },
  string: (data: any) => {
    if (!_.isString(data)) {
      console.log(genNotice['error']('MOCK ERROR', `${data} is not a string`))
      throw new Error('Invalid data type')
    }
    return data
  },
  jsonFilePath: (data: any) => {
    if (!data.endsWith('.json')) {
      console.log(genNotice['error']('MOCK ERROR', `${data} is not a json file`))
      throw new Error('Invalid file format')
    }
    return data
  },
  port: (data: any) => {
    if (data < 0 || data > 65535) {
      console.log(genNotice['error']('MOCK ERROR', 'Invalid port number'))
      throw new Error('Invalid port number')
    }
    return data
  },
  fileExist: (data: any) => {
    if (!fs.existsSync(data)) {
      console.log(genNotice['error']('MOCK ERROR', `File not exist at ${data}`))
      throw new Error('File not exist')
    }
    return data
  },
  hasMockOrigin: (data: any) => {
    const { mockPath, openApi } = data
    if (!mockPath && !openApi) {
      console.log(genNotice['error']('MOCK ERROR', 'mockPath or openApi is required'))
      throw new Error('mockPath or openApi is required')
    }
    return data
  },
}

/**
 * 数据类型检查
 * @param data - 数据源
 * @param queue - 检查队列
 */
const checkData = (data: any, queue: Array<keyof typeof check>) => {
  queue.forEach((key) => {
    check[key](data)
  })
}

// 检查插件配置
export const checkPluginOptions = (options: ServerOptions): void => {
  checkData(options, ['isObject'])
  const { port, mockPath, openApi } = options

  checkData(options, ['hasMockOrigin'])
  checkData(port, ['interger', 'port'])
  mockPath && checkData(mockPath, ['string', 'fileExist'])
  openApi && checkData(openApi, ['string', 'jsonFilePath'])
}
