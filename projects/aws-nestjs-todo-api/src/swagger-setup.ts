import * as swaggerUi from 'swagger-ui-express'
import * as path from 'path'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { INestApplication } from '@nestjs/common'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Setup Swagger/OpenAPI documentation for both local and Lambda environments
 * @param app NestJS application instance
 */
export function setupSwagger(app: INestApplication): void {
  try {
    // Try multiple paths for swagger.json
    // 1. Current working directory (local dev)
    // 2. Same directory as this file (for TypeScript)
    // 3. Parent directories (for Lambda dist folder)
    let swaggerPath: string | null = null
    const candidatePaths = [
      path.join(process.cwd(), 'swagger.json'),
      path.join(__dirname, 'swagger.json'),
      path.join(__dirname, '..', 'swagger.json'),
      path.join(__dirname, '..', '..', 'swagger.json'),
    ]

    for (const candidate of candidatePaths) {
      if (existsSync(candidate)) {
        swaggerPath = candidate
        break
      }
    }

    if (!swaggerPath) {
      throw new Error(`swagger.json not found in any candidate paths: ${candidatePaths.join(', ')}`)
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
    console.warn('⚠️  Swagger documentation not available:', (err as Error).message)
  }
}
