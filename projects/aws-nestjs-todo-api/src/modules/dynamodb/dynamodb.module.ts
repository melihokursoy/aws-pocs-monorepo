import { Global, Module } from '@nestjs/common'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

console.log('📦 Initializing DynamoDB Module...')
console.log('AWS_REGION:', process.env.AWS_REGION || 'us-east-1')
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Not set')

let docClient: DynamoDBDocumentClient
try {
  const dynamodbClient = new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
  })
  docClient = DynamoDBDocumentClient.from(dynamodbClient, {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  })
  console.log('✅ DynamoDB client initialized successfully')
} catch (error) {
  console.error('❌ Failed to initialize DynamoDB client:', error)
  throw new Error(`DynamoDB initialization failed: ${error instanceof Error ? error.message : String(error)}`)
}

@Global()
@Module({
  providers: [
    {
      provide: 'DYNAMODB_CLIENT',
      useValue: docClient,
    },
  ],
  exports: ['DYNAMODB_CLIENT'],
})
export class DynamoDBModule {}
