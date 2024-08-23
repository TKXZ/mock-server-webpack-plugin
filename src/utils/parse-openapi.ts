import fs from 'node:fs'
import fsp from 'node:fs/promises'
import { genNotice } from '@/utils/notice'
import _, { propertyOf } from 'lodash'

type SchemaItemType = 'number' | 'integer' | 'string' | 'boolean'

export const getOSAJSON = async (url: string) => {
  let res
  try {
    if (url.startsWith('http') || url.startsWith('https')) {
      res = await fetch(url)
      return res.json()
    } else {
      if (fs.existsSync(url)) {
        res = await fsp.readFile(url, 'utf-8')
        return JSON.parse(res)
      } else {
        throw Error('Invalid openApi local file path')
      }
    }
  } catch (error: any) {
    console.log(genNotice['error']('MOCK SERVER ERROR', error))
  }
}

export const getRoutes = (OSA: Record<string, any>) => {
  const paths = OSA.paths
  const dtos = []
  for (const [dtoName, dtoSchema] of Object.entries(OSA?.components?.schemas ?? {})) {
    dtos.push({
      dtoName,
      dtoSchema,
    })
  }
  const routes = []
  for (const [route, detail = {}] of Object.entries(paths)) {
    for (const [method, info] of Object.entries(detail as Object)) {
      const { requestBody = {}, parameters = [], responses = {} } = info
      resolveReqBody(requestBody)
    }
  }
}

function resolveReqBody(body: Record<string, any>) {
  const reqContentType = Object.keys(body?.content ?? {})[0]
  const reqContentSchema = body?.content?.[reqContentType]?.schema ?? {}
  const $ref = reqContentSchema?.$ref
  const { type, items } = reqContentSchema
  const { type: schemaItemType, format } = items ?? {}

  const dataSchemas = []
  if (items) {
    dataSchemas.push({
      type,
      itemType: resolveItemType(schemaItemType),
    })
  }

  return {
    reqType: reqContentType,
    dataSchemas,
  }
}

function resolveItemType(type: SchemaItemType): Exclude<SchemaItemType, 'integer'> {
  if (type === 'number' || type === 'integer') {
    return 'number'
  } else {
    return type
  }
}

function getRef(OSA: Record<string, any>, ref: string): Record<string, any> {
  const refName = ref.split('/').pop()
  if (refName) {
    return OSA?.components?.schemas?.[refName] || {}
  } else {
    return {}
  }
}

function hasRef(schema: Record<string, any>): boolean {
  if (schema.$ref || schema?.items?.$ref) {
    return true
  } else {
    return false
  }
}

/**
 * 获取 DTO层 数据
 * !禁止 循环DTO 引用
 */
export function getDtos(OSA: Record<string, any>) {
  const dtos = []

  const getDeepDto = (schemas: Record<string, any>) => {
    const res = {} as Record<string, any>

    for (const [propName, detail] of Object.entries(schemas)) {
      const __dtl = detail as Record<string, any>
      if (hasRef(__dtl)) {
        const ref = __dtl.$ref || ''
        const refSchema = getRef(OSA, ref).properties || {}
        res[propName] = getDeepDto(refSchema)
      } else {
        res[propName] = {
          type: resolveItemType(__dtl.type),
        }
      }
    }
    return res
  }

  for (const [dtoName, dtoSchema] of Object.entries(OSA?.components?.schemas ?? {})) {
    const { properties, type = '' } = dtoSchema as Record<string, any>
    dtos.push({
      [dtoName]: {
        type,
        props: getDeepDto(properties),
      },
    })
  }
  return dtos
}
