import 'reflect-metadata'
import dotenv from 'dotenv'
console.log('📋 Loading environment variables...')
dotenv.config()
console.log('✅ Environment loaded:', { region: process.env.AWS_REGION, hasKey: !!process.env.AWS_ACCESS_KEY_ID })

import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
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

  await app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on http://localhost:3000')
  })
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
