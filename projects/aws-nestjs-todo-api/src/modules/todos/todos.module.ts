import { Module } from '@nestjs/common'
import { TodosService } from './todos.service'
import { TodosController } from './todos.controller'
import { DynamoDBModule } from '../dynamodb/dynamodb.module'

@Module({
  imports: [DynamoDBModule],
  controllers: [TodosController],
  providers: [TodosService],
  exports: [TodosService],
})
export class TodosModule {}
