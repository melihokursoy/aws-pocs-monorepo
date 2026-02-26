import * as cdk from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2'
import * as apigatewayIntegrations from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { Construct } from 'constructs'

export interface TodoApiStackProps extends cdk.StackProps {}

export class TodoApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: TodoApiStackProps) {
    super(scope, id, props)

    // DynamoDB Table
    const todosTable = new dynamodb.Table(this, 'TodosTable', {
      tableName: 'todos',
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // Global Secondary Index for querying by status and creation date
    todosTable.addGlobalSecondaryIndex({
      indexName: 'status-createdAt-index',
      partitionKey: {
        name: 'status',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    })

    // Lambda Function
    const todoApiFunction = new NodejsFunction(this, 'TodoApiFunction', {
      functionName: 'TodoApiFunction',
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'handler',
      entry: 'src/lambda.ts',
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      bundling: {
        externalModules: [
          '@aws-sdk/*',
          '@nestjs/websockets',
          '@nestjs/microservices',
        ],
        tsconfig: 'tsconfig.lambda.json',
        esbuild: {
          external: [
            '@aws-sdk/*',
            '@nestjs/websockets',
            '@nestjs/microservices',
          ],
          minify: true,
          sourcemap: true,
        },
      },
      environment: {
        TODOS_TABLE_NAME: todosTable.tableName,
        NODE_OPTIONS: '--enable-source-maps',
      },
    })

    // Grant Lambda permissions to read/write to DynamoDB
    todosTable.grantReadWriteData(todoApiFunction)

    // HTTP API Gateway
    const httpApi = new apigateway.HttpApi(this, 'TodoApi', {
      apiName: 'TodoApi',
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [
          apigateway.HttpMethod.GET,
          apigateway.HttpMethod.POST,
          apigateway.HttpMethod.PUT,
          apigateway.HttpMethod.DELETE,
          apigateway.HttpMethod.PATCH,
          apigateway.HttpMethod.HEAD,
          apigateway.HttpMethod.OPTIONS,
        ],
        allowHeaders: ['*'],
      },
    })

    // Create integration
    const lambdaIntegration = new apigatewayIntegrations.HttpLambdaIntegration(
      'TodoApiIntegration',
      todoApiFunction
    )

    // Route all requests to Lambda
    httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [
        apigateway.HttpMethod.GET,
        apigateway.HttpMethod.POST,
        apigateway.HttpMethod.PUT,
        apigateway.HttpMethod.DELETE,
        apigateway.HttpMethod.PATCH,
        apigateway.HttpMethod.HEAD,
      ],
      integration: lambdaIntegration,
    })

    // Root path
    httpApi.addRoutes({
      path: '/',
      methods: [
        apigateway.HttpMethod.GET,
        apigateway.HttpMethod.POST,
        apigateway.HttpMethod.PUT,
        apigateway.HttpMethod.DELETE,
        apigateway.HttpMethod.PATCH,
        apigateway.HttpMethod.HEAD,
      ],
      integration: lambdaIntegration,
    })

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: httpApi.apiEndpoint,
      exportName: 'TodoApiUrl',
      description: 'API Gateway endpoint URL',
    })

    new cdk.CfnOutput(this, 'TableName', {
      value: todosTable.tableName,
      exportName: 'TodosTableName',
      description: 'DynamoDB table name',
    })

    new cdk.CfnOutput(this, 'FunctionName', {
      value: todoApiFunction.functionName,
      exportName: 'TodoApiFunctionName',
      description: 'Lambda function name',
    })
  }
}
