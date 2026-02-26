import { IsString, IsOptional, IsIn, Length } from 'class-validator'

export class UpdateTodoDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string

  @IsOptional()
  @IsIn(['todo', 'in-progress', 'completed'])
  status?: 'todo' | 'in-progress' | 'completed'
}
