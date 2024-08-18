import express, { Express } from 'express'
import bodyParser from 'body-parser'
import { cors } from '@/middleware/cors'

const server: Express = express()

server.all('*', cors)
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

export default server
