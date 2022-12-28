import 'source-map-support/register'

import * as uuid from 'uuid'

import { TodosAccess } from '../dataLayer/TodosAccess'
import { TodosStorage } from '../dataLayer/TodosStorage'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'

const logger = createLogger('todos')

const todosAccess = new TodosAccess()
const todosStorage = new TodosStorage()

export async function getTodos(userId: string): Promise<TodoItem[]> {
  logger.info(`Retrieving all todos for user ${userId}`, { userId })

  return await todosAccess.getTodoItems(userId)
}

export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
  const todoId = uuid.v4()
  const s3AttachmentUrl = todosStorage.getAttachmentUrl(todoId)

  const newItem: TodoItem = {
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: s3AttachmentUrl,
    ...createTodoRequest
  }

  logger.info(`Creating todo ${todoId} for user ${userId}`, { userId, todoId, todoItem: newItem })

  await todosAccess.createTodoItem(newItem)

  return newItem
}

export async function updateTodo(todoId: string, todoUpdate: UpdateTodoRequest, userId: string): Promise<TodoUpdate> {
  logger.info(`Updating todo ${todoId} for user ${userId}`, { userId, todoId, todoUpdate })

  const item = await todosAccess.getTodoItem(todoId)

  if (!item)
    throw new Error('Item not found')  

  if (item.userId !== userId) {
    logger.error(`User ${userId} does not have permission to update todo ${todoId}`)
    throw new Error('User is not authorized to update item') 
  }

  return todosAccess.updateTodoItem(todoId, userId, todoUpdate)
}

export async function deleteTodo(userId: string, todoId: string) {
  logger.info(`Deleting todo ${todoId} for user ${userId}`, { userId, todoId })

  const item = await todosAccess.getTodoItem(todoId)

  if (!item)
    throw new Error('Item not found')  

  if (item.userId !== userId) {
    logger.error(`User ${userId} does not have permission to delete todo ${todoId}`)
    throw new Error('User is not authorized to delete item')  
  }

  todosAccess.deleteTodoItem(todoId)
}

export async function generateUploadUrl(todoId: string, userId: string): Promise<string> {
  logger.info('Generating upload URL for attachment', userId, todoId)
  return todosStorage.getUploadUrl(todoId)
}
