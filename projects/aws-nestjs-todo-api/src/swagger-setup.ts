import * as swaggerUi from 'swagger-ui-express'
import { readFileSync, existsSync } from 'fs'
import { INestApplication } from '@nestjs/common'
import { SWAGGER_SPEC } from './swagger-spec'

/**
 * Setup Swagger/OpenAPI documentation for both local dev and production
 * Uses embedded spec for production, file for local development
 * @param app NestJS application instance
 */
export function setupSwagger(app: INestApplication): void {
  try {
    let swaggerDocument: any = SWAGGER_SPEC

    // Try to load from file for local development (fallback to embedded)
    const swaggerPath = 'swagger.json'
    if (existsSync(swaggerPath)) {
      try {
        swaggerDocument = JSON.parse(readFileSync(swaggerPath, 'utf8'))
        console.log('📄 Using swagger.json from file')
      } catch (fileErr) {
        console.log('📦 Using embedded Swagger spec')
      }
    } else {
      console.log('📦 Using embedded Swagger spec (file not found)')
    }

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
