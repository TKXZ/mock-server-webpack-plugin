import express, { Express } from 'express'
import bodyParser from 'body-parser'

const server: Express = express()

server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

export default server
