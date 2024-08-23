import { MockApiRecord } from '@/types'

export function prefixApiUrl(apis: MockApiRecord[], prefix: string = ''): MockApiRecord[] {
  return apis.map((api) => {
    api.url = prefix + api.url
    return api
  })
}
