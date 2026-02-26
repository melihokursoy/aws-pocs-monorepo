import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  Inject,
  NotFoundException,
} from '@nestjs/common'
import { TodosService } from './todos.service'
import { CreateTodoDto, UpdateTodoDto } from './dto'
import { Todo } from './entities/todo.entity'

@Controller('todos')
export class TodosController {
  constructor(@Inject(TodosService) private readonly todosService: TodosService) {}

  @Post()
  @HttpCode(201)
  async create(@Body() createTodoDto: CreateTodoDto): Promise<Todo> {
    return this.todosService.create(createTodoDto)
  }

  @Get()
  async findAll(): Promise<Todo[]> {
    return this.todosService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Todo> {
    const todo = await this.todosService.findOne(id)
    if (!todo) {
      throw new NotFoundException(`Todo with id ${id} not found`)
    }
    return todo
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto
  ): Promise<Todo> {
    const todo = await this.todosService.update(id, updateTodoDto)
    if (!todo) {
      throw new NotFoundException(`Todo with id ${id} not found`)
    }
    return todo
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    const success = await this.todosService.remove(id)
    if (!success) {
      throw new NotFoundException(`Todo with id ${id} not found`)
    }
  }
}
