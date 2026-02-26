import { Injectable, Inject } from '@nestjs/common'
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { Todo } from './entities/todo.entity'
import { CreateTodoDto, UpdateTodoDto } from './dto'

@Injectable()
export class TodosService {
  private tableName: string

  constructor(
    @Inject('DYNAMODB_CLIENT')
    private dynamodbClient: DynamoDBDocumentClient
  ) {
    this.tableName = process.env.TODOS_TABLE_NAME || 'todos'
    console.log('✅ TodosService initialized')
    console.log('   Table name:', this.tableName)
    console.log('   DynamoDB client:', this.dynamodbClient ? '✅ Available' : '❌ Undefined')
  }

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const id = uuidv4()
    const now = new Date().toISOString()

    const todo: Todo = {
      id,
      title: createTodoDto.title,
      description: createTodoDto.description,
      status: createTodoDto.status || 'todo',
      createdAt: now,
      updatedAt: now,
    }

    await this.dynamodbClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: todo,
      })
    )

    return todo
  }

  async findAll(): Promise<Todo[]> {
    const result = await this.dynamodbClient.send(
      new ScanCommand({
        TableName: this.tableName,
      })
    )

    return (result.Items as Todo[]) || []
  }

  async findOne(id: string): Promise<Todo | null> {
    const result = await this.dynamodbClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      })
    )

    return (result.Item as Todo) || null
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo | null> {
    // First check if todo exists
    const existing = await this.findOne(id)
    if (!existing) {
      return null
    }

    // Build update expression and attribute names
    const updates: string[] = []
    const expressionAttributeValues: Record<string, any> = {}
    const now = new Date().toISOString()

    updates.push('updatedAt = :updatedAt')
    expressionAttributeValues[':updatedAt'] = now

    if (updateTodoDto.title !== undefined) {
      updates.push('title = :title')
      expressionAttributeValues[':title'] = updateTodoDto.title
    }

    if (updateTodoDto.description !== undefined) {
      updates.push('description = :description')
      expressionAttributeValues[':description'] = updateTodoDto.description
    }

    if (updateTodoDto.status !== undefined) {
      updates.push('#status = :status')
      expressionAttributeValues[':status'] = updateTodoDto.status
    }

    const result = await this.dynamodbClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression: `SET ${updates.join(', ')}`,
        ExpressionAttributeNames: updateTodoDto.status
          ? { '#status': 'status' }
          : undefined,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
        ConditionExpression: 'attribute_exists(id)',
      })
    )

    return (result.Attributes as Todo) || null
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.dynamodbClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { id },
        ConditionExpression: 'attribute_exists(id)',
      })
    )

    return result.$metadata.httpStatusCode === 200
  }
}
