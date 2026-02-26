#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { S3StaticSiteStack } from '../lib/s3-static-site-stack'

const app = new cdk.App()

new S3StaticSiteStack(app, 'S3StaticSiteStack', {
  description: 'AWS S3 Static Website Deployment with CDK',
  siteName: 'aws-s3-static-website',
})

app.synth()
