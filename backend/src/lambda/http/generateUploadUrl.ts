import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { generateUploadUrl } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('generateUploadUrl')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing generateUploadUrl event', { event })
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  console.log('userId: ', userId)
  const url = await generateUploadUrl(todoId, userId)

  return {
    statusCode: 201,
    body: JSON.stringify({
      uploadUrl: url
    })
  }
})

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
