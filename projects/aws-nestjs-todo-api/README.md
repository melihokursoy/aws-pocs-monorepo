# NestJS Lambda Todo CRUD API

A serverless Todo CRUD API built with NestJS, AWS Lambda, API Gateway, and DynamoDB, deployed using AWS CDK.

## Architecture

- **Framework**: NestJS 10
- **Compute**: AWS Lambda (ARM64, 512MB, 30s timeout)
- **API**: HTTP API Gateway v2 (with CORS enabled)
- **Database**: Amazon DynamoDB (on-demand billing)
- **Infrastructure**: AWS CDK (TypeScript)
- **Deployment**: CloudFormation

### Key Features

- ✅ Cached NestJS server pattern for optimal cold start performance
- ✅ Module-level DynamoDB client for connection reuse
- ✅ CORS enabled for cross-origin requests
- ✅ Request validation using class-validator DTOs
- ✅ Global error handling with NestJS exception filters
- ✅ ARM64 Graviton2 architecture for better performance
- ✅ esbuild bundling with tree shaking
- ✅ Point-in-time recovery ready (can enable via CDK)

## Project Structure

```
aws-nestjs-todo-api/
├── cdk/
│   ├── bin/
│   │   └── app.ts                    # CDK entry point
│   └── lib/
│       ├── todo-api-stack.ts         # Infrastructure stack
│       └── index.ts                  # Exports
├── src/
│   ├── lambda.ts                     # Lambda handler (cached server)
│   ├── main.ts                       # Local dev entry point
│   ├── app.module.ts                 # Root NestJS module
│   └── modules/
│       ├── dynamodb/
│       │   └── dynamodb.module.ts    # Global DynamoDB module
│       └── todos/
│           ├── todos.module.ts       # Feature module
│           ├── todos.controller.ts   # REST endpoints
│           ├── todos.service.ts      # Business logic
│           ├── entities/
│           │   └── todo.entity.ts    # Todo interface
│           └── dto/
│               ├── create-todo.dto.ts
│               ├── update-todo.dto.ts
│               └── index.ts
├── cdk.json                          # CDK configuration
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript config (ES modules)
├── tsconfig.lambda.json              # Lambda TypeScript config (CommonJS)
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- AWS CLI configured with appropriate credentials
- CDK CLI: `npm install -g aws-cdk`

### Installation

```bash
# From monorepo root
pnpm install

# Navigate to project
cd projects/aws-nestjs-todo-api

# Or install just this project
pnpm install
```

### Local Development

Run the local development server:

```bash
pnpm dev
```

The server will start on `http://localhost:3000`

### Testing with cURL

```bash
# Create a todo
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn NestJS",
    "description": "Build a serverless API",
    "status": "in-progress"
  }'

# List todos
curl http://localhost:3000/todos

# Get specific todo
curl http://localhost:3000/todos/{id}

# Update todo
curl -X PUT http://localhost:3000/todos/{id} \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'

# Delete todo
curl -X DELETE http://localhost:3000/todos/{id}
```

## API Endpoints

### Create Todo
```
POST /todos
Content-Type: application/json

{
  "title": "string (required, 1-255 chars)",
  "description": "string (optional, 0-1000 chars)",
  "status": "todo | in-progress | completed (optional, defaults to 'todo')"
}

Response: 201 Created
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status": "string",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### List All Todos
```
GET /todos

Response: 200 OK
[
  { Todo objects... }
]
```

### Get Todo by ID
```
GET /todos/:id

Response: 200 OK or 404 Not Found
{ Todo object }
```

### Update Todo
```
PUT /todos/:id
Content-Type: application/json

{
  "title": "string (optional)",
  "description": "string (optional)",
  "status": "string (optional)"
}

Response: 200 OK or 404 Not Found
{ Updated Todo object }
```

### Delete Todo
```
DELETE /todos/:id

Response: 204 No Content or 404 Not Found
```

## Deployment

### Synthesize CloudFormation Template

```bash
pnpm cdk:synth
```

This generates the CloudFormation template in `cdk.out/` directory.

### Deploy to AWS

```bash
pnpm cdk:deploy
```

This will:
1. Create the DynamoDB table
2. Create the Lambda function with dependencies bundled
3. Create the HTTP API Gateway with CORS enabled
4. Output the API URL and other resource names

### Get API URL After Deployment

```bash
aws cloudformation describe-stacks --stack-name TodoApiStack \
  --query 'Stacks[0].Outputs' --output table
```

### Test Deployed API

```bash
# Set your API URL
API_URL=https://your-api-gateway-endpoint.execute-api.region.amazonaws.com

# Create todo
curl -X POST $API_URL/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"My First Task"}'

# List todos
curl $API_URL/todos
```

### View Lambda Logs

```bash
# Stream logs
aws logs tail /aws/lambda/TodoApiFunction --follow

# Or view specific date range
aws logs filter-log-events \
  --log-group-name /aws/lambda/TodoApiFunction \
  --start-time $(date -d '1 hour ago' +%s)000 \
  --query 'events[*].message' \
  --output text
```

### Check DynamoDB

```bash
# Scan all items
aws dynamodb scan --table-name todos

# Query by status and creation date
aws dynamodb query --table-name todos \
  --index-name status-createdAt-index \
  --key-condition-expression "s = :status" \
  --expression-attribute-values '{":status":{"S":"completed"}}'
```

### Destroy Stack

```bash
pnpm cdk:destroy
```

## Performance Optimizations

### 1. Cached Server Pattern
The Lambda handler caches the NestJS application instance across invocations:
```typescript
let cachedServer: Handler
export const handler = async (event, context) => {
  if (!cachedServer) {
    cachedServer = await bootstrapServer()
  }
  return cachedServer(event, context)
}
```

This minimizes cold start time by reusing the same NestJS instance.

### 2. Module-Level DynamoDB Client
The DynamoDB client is instantiated at the module level (once per Lambda container):
```typescript
const docClient = DynamoDBDocumentClient.from(...)
```

This reuses the HTTP connection pool across requests.

### 3. ARM64 Architecture
Uses AWS Graviton2 processors for better price/performance ratio and faster execution.

### 4. Event Loop Optimization
Prevents Lambda from waiting for event loop to drain:
```typescript
context.callbackWaitsForEmptyEventLoop = false
```

This allows DynamoDB connections to persist across invocations.

### 5. esbuild Bundling
- Tree shaking removes unused code
- Minification reduces bundle size
- External modules (@aws-sdk) are handled by Lambda runtime

## Production Considerations

### Security
- [ ] Restrict CORS origins to specific domains
- [ ] Add authentication (Cognito, JWT with NestJS Guards)
- [ ] Enable API key requirement
- [ ] Use VPC endpoints for DynamoDB access

### Observability
- [ ] Enable API Gateway access logs to CloudWatch
- [ ] Enable X-Ray tracing for Lambda and DynamoDB
- [ ] Create CloudWatch alarms for errors and throttling
- [ ] Add custom metrics (cold starts, execution duration)

### Availability & Performance
- [ ] Configure CloudFront distribution for caching
- [ ] Enable DynamoDB point-in-time recovery
- [ ] Consider provisioned concurrency for consistent latency
- [ ] Implement pagination for list endpoint

### Cost Optimization
- [ ] Monitor DynamoDB on-demand billing
- [ ] Set up CloudWatch alarms for cost anomalies
- [ ] Consider reserved capacity for predictable workloads
- [ ] Enable S3 access logging for audit trails

## Troubleshooting

### Cold Start Issues
- Check Lambda memory allocation (512MB recommended)
- Review CloudWatch logs for bootstrap time
- Consider provisioned concurrency for consistent latency

### DynamoDB Throttling
- Monitor consumed capacity in CloudWatch
- Consider switching to provisioned capacity if predictable
- Implement exponential backoff in retry logic

### CORS Errors
- Verify API Gateway CORS configuration
- Check browser console for specific error messages
- Ensure Origin header matches allowed origins

### Large DynamoDB Scans
- Implement pagination using `LastEvaluatedKey`
- Use Query with GSI instead of Scan when possible
- Consider enabling DynamoDB Streams for real-time data

## Dependencies

### Runtime
- `@nestjs/core` (^10.0.0) - NestJS framework
- `@nestjs/platform-express` (^10.0.0) - Express adapter
- `@codegenie/serverless-express` (^4.14.0) - Serverless Express wrapper
- `@aws-sdk/client-dynamodb` (^3.500.0) - DynamoDB client
- `@aws-sdk/lib-dynamodb` (^3.500.0) - DynamoDB document client
- `class-validator` (^0.14.0) - DTO validation
- `class-transformer` (^0.5.1) - DTO transformation
- `uuid` (^9.0.1) - ID generation
- `rxjs` (^7.8.1) - Reactive programming
- `reflect-metadata` (^0.1.13) - Metadata reflection

### Development
- `aws-cdk-lib` (^2.140.0) - AWS CDK
- `constructs` (^10.3.0) - CDK constructs
- `typescript` (^5.3.0) - TypeScript compiler
- `tsx` (^4.0.0) - TypeScript executor
- `esbuild` (^0.19.0) - JavaScript bundler

## TypeScript Configuration

### Dual Configuration Strategy
- **tsconfig.json**: ES modules for CDK (follows monorepo pattern)
- **tsconfig.lambda.json**: CommonJS for Lambda (required by serverless-express)

The CDK NodejsFunction uses esbuild to perform the final bundling and module format conversion.

## Contributing

See the main monorepo README for contribution guidelines.

## License

Same as the main monorepo.
