import { genNotice } from './notice'

export const checkPort = (port: number): boolean => {
  if (typeof port !== 'number') {
    console.log(genNotice['error']('MOCK ERROR', 'Port number must be a number'))
    throw new Error('Port number must be a number')
  }
  if (port < 0 || port > 65535) {
    console.log(genNotice['error']('MOCK ERROR', 'Invalid port number'))
    throw new Error('Invalid port number')
  }
  return true
}

export const checkMockPath = (mockPath: string): boolean => {
  if (!mockPath) {
    console.log(genNotice['error']('MOCK ERROR', 'mockPath in mock-server-webpack-plugin is required'))
    throw new Error('mockPath in mock-server-webpack-plugin is required')
  }
  return true
}
