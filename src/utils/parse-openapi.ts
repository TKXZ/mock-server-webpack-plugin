import fs from 'node:fs'
import fsp from 'node:fs/promises'
import type { Request } from 'express'
import { genNotice } from '@/utils/notice'
import _ from 'lodash'

/**
 * 获取 OpenApi 数据(json)
 * @param url - 本地或远程数据地址
 * @returns
 */
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

/**
 * 解析 OpenApi 数据 获取路由信息
 * @param OSA
 * @returns
 */
const getRoutes = (OSA: Record<string, any>) => {
  const routes = []
  const paths = OSA.paths
  const dtos = getDtos(OSA)

  for (const [route, detail = {}] of Object.entries(paths)) {
    for (const [method, info] of Object.entries(detail as Object)) {
      const { requestBody = {}, parameters = [], responses = {} } = info
      const response = resolveResponse(responses, dtos)
      routes.push({
        route: resolveRoute(route),
        method,
        response,
      })
    }
  }
  return routes
}

function resolveRoute(route: string) {
  return route.replace(/{[^}]+}/g, '*')
}

/**
 * 解析响应数据(仅200状态码)
 * @param responses
 * @param dtos
 * @returns
 */
function resolveResponse(responses: Record<string, any>, dtos: Record<string, any>) {
  const res = {} as Record<string, any>
  const detail = responses['200']
  const { content = {}, description } = detail
  res['200'] = resolveContent(content, dtos)
  return res
}

function resolveContent(content: Record<string, any>, dtos: Record<string, any>) {
  let reqContentType = Object.keys(content ?? {})[0]
  const reqContentSchema = content?.[reqContentType]?.schema ?? {}
  const $ref = reqContentSchema?.$ref
  const { type, items } = reqContentSchema
  const { type: schemaItemType, format } = items ?? {}

  const dataSchemas = []
  if (items) {
    dataSchemas.push({
      type,
      itemType: resolveItemType(schemaItemType),
    })
  } else if ($ref) {
    dataSchemas.push(getRef(dtos, $ref))
  }

  return {
    reqType: resolveHttpDataType(reqContentType),
    dataSchemas,
  }
}

function resolveHttpDataType(type: string) {
  if (type === '*/*') {
    return 'application/json'
  } else {
    return type
  }
}

/**
 * 解析 Schema 基本数据
 */
type SchemaItemType = 'number' | 'integer' | 'string' | 'boolean'
function resolveItemType(type: SchemaItemType): Exclude<SchemaItemType, 'integer'> {
  if (type === 'number' || type === 'integer') {
    return 'number'
  } else {
    return type
  }
}

/**
 * 从解析后的DTO中获取引用数据
 * @param dtos
 * @param ref
 * @returns
 */
function getRef(dtos: Record<string, any>, ref: string) {
  const refName = ref.split('/').pop()
  if (refName) {
    return dtos[refName] || {}
  } else {
    return {}
  }
}

/**
 * 从原始OSA数据中获取DTO数据
 * @param OSA
 * @param ref
 * @returns
 */
function getOriginRef(OSA: Record<string, any>, ref: string): Record<string, any> {
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
  const dtos = {} as Record<string, any>

  const getDeepDto = (schemas: Record<string, any>, type: string) => {
    let res = type === 'object' ? {} : ([] as any)

    for (const [propName, detail] of Object.entries(schemas)) {
      const __dtl = detail as Record<string, any>
      if (hasRef(__dtl)) {
        const ref = __dtl.$ref || __dtl?.items?.$ref || ''
        const type = __dtl.type ?? 'object'
        const refSchema = getOriginRef(OSA, ref).properties || {}
        res[propName] = {
          type,
          schema: getDeepDto(refSchema, type),
        }
      } else {
        if (type === 'object') {
          res[propName] = {
            type: resolveItemType(__dtl.type),
          }
        } else if (type === 'array') {
          res.push({
            name: propName,
            type: resolveItemType(__dtl.type),
          })
        }
      }
    }
    return res
  }

  for (const [dtoName, dtoSchema] of Object.entries(OSA?.components?.schemas ?? {})) {
    const { properties, type = '' } = dtoSchema as Record<string, any>
    dtos[dtoName] = {
      type,
      schema: getDeepDto(properties, type),
    }
  }
  return dtos
}

function generateExpressApiByRoutes(routes: Array<any>) {
  /**
   * Mockjs 基本数据类型转换
   * @param type
   * @param name
   * @returns
   */
  function prop2Mockjs(type: string, name?: string) {
    if (name === 'code') {
      return '@integer(200, 200)'
    }

    switch (type) {
      case 'string':
        return '@sentence(4, 10)'
      case 'number':
        return '@integer(1, 200)'
      case 'boolean':
        return '@boolean'
      default:
        return '@sentence(4, 10)'
    }
  }

  function parseSchemas(schema: Record<string, any> | Array<any>) {
    const schemaType = Array.isArray(schema) ? 'array' : 'object'
    const res = schemaType === 'array' ? [] : ({} as any)

    // 针对array 类型数据优化, 使结果元素更多
    if (schemaType === 'array') {
      res.push({})
      schema.forEach((item: any) => {
        const { name, type } = item
        if (type) {
          res[0][name] = prop2Mockjs(type)
        } else {
          res[0][name] = parseSchemas(item)
        }
      })
    } else if (schemaType === 'object') {
      for (const [propName, __schema] of Object.entries(schema)) {
        const { type } = __schema
        if (type === 'array') {
          res[propName + '|20'] = parseSchemas(__schema?.schema || {})
        } else if (type === 'object') {
          res[propName] = parseSchemas(__schema?.schema || {})
        } else if (type) {
          res[propName] = prop2Mockjs(type, propName)
        }
      }
    }

    return res
  }

  const res = [] as Array<any>

  routes.forEach((r) => {
    const { route, method, response } = r
    const { dataSchemas } = response['200']
    const [dataSchema] = dataSchemas
    const { type: pType, schema } = dataSchema || {}

    // 生成响应数据(用于注册路由)
    const responseFn = (req: Request) => {
      const data = parseSchemas(schema)
      return data
    }
    res.push({
      url: route,
      method,
      response: responseFn,
    })
  })
  return res
}

/**
 * 通过 OpenApi 生成 Express 接口
 * @param url - OpenApi 数据地址(json)
 * @returns
 */
export async function getApiFromOSA(url: string) {
  const res = await getOSAJSON(url)
  const routes = getRoutes(res)
  return generateExpressApiByRoutes(routes)
}
