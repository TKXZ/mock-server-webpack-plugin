import { genNotice } from './notice'

export const checkPort = (port: number): boolean => {
  if (port < 0 || port > 65535) {
    console.log(genNotice['error']('Error', 'Invalid port number'))
    throw new Error('Invalid port number')
  }
  return true
}

export const checkMockPath = (mockPath: string): boolean => {
  if (!mockPath) {
    console.log(genNotice['error']('Error', 'mockPath in mock-server-webpack-plugin is required'))
    throw new Error('mockPath in mock-server-webpack-plugin is required')
  }
  return true
}
