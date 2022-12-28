import 'source-map-support/register'

import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
const s3BucketName = process.env.ATTACHMENTS_S3_BUCKET


export class TodosStorage {
    constructor(
      private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
      private readonly bucketName = s3BucketName,
      private readonly uploadUrl = parseInt(
        process.env.ATTACHMENT_UPLOAD_URL_EXPIRATION || '0'
      ),
  ) {}

    getAttachmentUrl(todoId: string) {
      return  `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
  }

    getUploadUrl(todoId: string): string {
      console.log('calling getUploadUrl')
      return this.s3.getSignedUrl('putObject', {
        Bucket: this.bucketName,
        Key: todoId,
        Expires: this.uploadUrl
      })
  }
}
