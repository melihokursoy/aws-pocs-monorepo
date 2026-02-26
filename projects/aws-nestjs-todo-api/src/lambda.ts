import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import serverlessExpress from '@codegenie/serverless-express'
import { Callback, Context, Handler } from 'aws-lambda'
import { AppModule } from './app.module'
import { setupSwagger } from './swagger-setup'

let cachedServer: Handler

async function bootstrapServer() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  })

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    })
  )

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })

  // Setup Swagger documentation (works in both local and Lambda environments)
  setupSwagger(app)

  await app.init()

  const expressApp = app.getHttpAdapter().getInstance()
  return serverlessExpress({ app: expressApp })
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback
) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    if (!cachedServer) {
      console.log('Bootstrapping NestJS server...')
      cachedServer = await bootstrapServer()
      console.log('Server bootstrapped successfully')
    }

    return cachedServer(event, context, callback)
  } catch (error) {
    console.error('Error in handler:', error)
    throw error
  }
}
