import * as swaggerUi from 'swagger-ui-express'
import { readFileSync, existsSync } from 'fs'
import * as path from 'path'
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

    // Check if running in production (Lambda) or local
    const isProduction = process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined

    // Create custom HTML for Swagger UI that works in both environments
    const createSwaggerHtml = () => {
      const swaggerJsonUrl = `${isProduction ? 'https://h5ciyx6ll0.execute-api.us-east-1.amazonaws.com' : 'http://localhost:3000'}/api/swagger.json`

      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Todo API Documentation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.css">
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; padding: 0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-standalone-preset.js"></script>
  <script>
    SwaggerUIBundle({
      url: "${swaggerJsonUrl}",
      dom_id: '#swagger-ui',
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIStandalonePreset
      ],
      layout: "BaseLayout",
      deepLinking: true
    })
  </script>
</body>
</html>`
    }

    // API endpoint to serve the swagger spec as JSON
    expressApp.get('/api/swagger.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json')
      res.json(swaggerDocument)
    })

    // API endpoint to serve Swagger UI HTML with CDN assets
    expressApp.get('/api', (req, res) => {
      res.setHeader('Content-Type', 'text/html')
      res.send(createSwaggerHtml())
    })

    expressApp.get('/api-docs', (req, res) => {
      res.setHeader('Content-Type', 'text/html')
      res.send(createSwaggerHtml())
    })

    console.log('✅ Swagger documentation available at /api and /api-docs')
  } catch (err) {
    console.warn('⚠️  Swagger setup failed:', (err as Error).message)
  }
}
