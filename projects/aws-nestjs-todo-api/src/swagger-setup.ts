import * as swaggerUi from 'swagger-ui-express'
import { readFileSync, existsSync } from 'fs'
import { INestApplication } from '@nestjs/common'

/**
 * Setup Swagger/OpenAPI documentation for local development
 * Note: Swagger is only available in local development, not in Lambda
 * @param app NestJS application instance
 */
export function setupSwagger(app: INestApplication): void {
  try {
    // Look for swagger.json in the current working directory (local dev)
    const swaggerPath = 'swagger.json'

    if (!existsSync(swaggerPath)) {
      console.log('ℹ️  Swagger documentation not available (only in local development)')
      return
    }

    const swaggerDocument = JSON.parse(readFileSync(swaggerPath, 'utf8'))

    // Get the underlying Express app
    const expressApp = app.getHttpAdapter().getInstance()

    // Setup Swagger UI at multiple endpoints
    expressApp.use('/api-docs', swaggerUi.serve)
    expressApp.get('/api-docs', swaggerUi.setup(swaggerDocument))
    expressApp.use('/api', swaggerUi.serve)
    expressApp.get('/api', swaggerUi.setup(swaggerDocument))

    console.log('✅ Swagger documentation available at /api and /api-docs')
  } catch (err) {
    console.warn('⚠️  Swagger setup failed:', (err as Error).message)
  }
}
