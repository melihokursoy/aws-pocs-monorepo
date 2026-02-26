import 'reflect-metadata'
import dotenv from 'dotenv'
console.log('📋 Loading environment variables...')
dotenv.config()
console.log('✅ Environment loaded:', { region: process.env.AWS_REGION, hasKey: !!process.env.AWS_ACCESS_KEY_ID })

import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import * as swaggerUi from 'swagger-ui-express'
import * as path from 'path'
import { readFileSync } from 'fs'
import { AppModule } from './app.module'

console.log('📦 AppModule imported')

async function bootstrap() {
  console.log('🚀 Creating NestJS app...')
  const app = await NestFactory.create(AppModule)
  console.log('✅ NestJS app created')

  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })

  // Setup Swagger using static JSON file
  try {
    const swaggerPath = path.join(process.cwd(), 'swagger.json')
    const swaggerDocument = JSON.parse(readFileSync(swaggerPath, 'utf8'))
    const expressApp = app.getHttpAdapter().getInstance()
    expressApp.use('/api-docs', swaggerUi.serve)
    expressApp.get('/api-docs', swaggerUi.setup(swaggerDocument))
    expressApp.use('/api', swaggerUi.serve)
    expressApp.get('/api', swaggerUi.setup(swaggerDocument))
    console.log('✅ Swagger documentation available at /api and /api-docs')
  } catch (err) {
    console.warn('⚠️  Swagger documentation not available:', (err as Error).message)
  }

  await app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://localhost:3000')
    console.log('Swagger API docs available at http://localhost:3000/api')
  })
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
