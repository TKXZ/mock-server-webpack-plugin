# mock-server-webpack-plugin

- **:wrench: 同时支持`webpack 4` 与 `webpack 5`**
- **:key: 同时支持 `ESM` 规范与 `CommonJS` 规范 ​**
- **:black_nib: 内置[mockjs](http://mockjs.com/), 多种数据结构随意组合**
- **:fire: 支持热更新 ​，修改 Mock 数据无需重新启动服务**
- **:bulb: `Typescript` 编写，更好的类型提示**
- **:hatching_chick: 开发友好，无跨域问题，无需依赖其他服务**
- **:hammer: (实验性功能)解析 OpenApi 3 规范数据文件,快速生成可用 Mock 服务**

> [!WARNING]
> 由于 Mock 与实际后端模拟数据存在较大差异, 原因在于逻辑的复杂度不同, 以及使用目的不同, 因此建议您在使用 openApi 3 解析产生的 mock 服务时, 应更加注重逻辑依赖较弱且数据量较多的接口, 如果必须, 请使用 mockPath 模式进行自定义逻辑与数据

## 开始

### 安装

```sh
npm install mock-server-webpack-plugin -D
or
pnpm add mock-server-webpack-plugin -D
```

### 引入

`ESM`

```js
import path from 'path'
import { Configuration } from 'webpack'
import MockServerWebpackPlugin from 'mock-server-webpack-plugin'

const config: Configuration = {
  mode: 'development',
  // ...
  plugins: [
    new MockServerWebpackPlugin({
      port: 3636,
      mockPath: path.resolve('./mock.js'),
    }),
  ],
}

export default config
```

`CommonJS`

```js
const path = require('path')
const { Configuration } = require('webpack')
const MockServerWebpackPlugin = require('mock-server-webpack-plugin')

/**
 * @type {Configuration}
 */
const config = {
  mode: 'development',
  // ...
  plugins: [
    new MockServerWebpackPlugin({
      port: 3000,
      mockPath: path.resolve('./mock.js'),
    }),
  ],
}

module.exports = config
```

### 接口编写

```js
const Mockjs = require('mockjs')

const mockUserList = Mockjs.mock({
  'data|50': [
    {
      'id|+1': 1,
      name: '@cname',
      age: '@integer(10, 60)',
    },
  ],
})

module.exports = [
  {
    url: '/user-list',
    method: 'get',
    response: () => {
      return {
        code: 200,
        data: mockUserList.data,
      }
    },
  },
  {
    url: '/add-user',
    method: 'post',
    response: (req) => {
      const { name, age } = req.body
      mockUserList.data.push({
        id: mockUserList.data.length + 1,
        name,
        age,
      })
      return {
        code: 200,
        message: '添加成功',
      }
    },
  },
  {
    url: '/delete-user',
    method: 'delete',
    response: (req) => {
      const { id } = req.query
      const index = mockUserList.data.findIndex((item) => item.id === Number(id))
      mockUserList.data.splice(index, 1)
      return {
        code: 200,
        message: '删除成功',
      }
    },
  },
]
```
