export interface Todo {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'completed'
  createdAt: string
  updatedAt: string
}
