import * as cdk from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import * as iam from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'
import * as path from 'path'

export interface S3StaticSiteStackProps extends cdk.StackProps {
  siteName?: string
}

export class S3StaticSiteStack extends cdk.Stack {
  public readonly bucket: s3.Bucket
  public readonly distribution: cloudfront.Distribution

  constructor(scope: Construct, id: string, props?: S3StaticSiteStackProps) {
    super(scope, id, props)

    const siteName = props?.siteName || 'aws-s3-static-website'

    // Create S3 bucket for website content
    this.bucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `${siteName}-${this.account}-${this.region}`.toLowerCase(),
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    // Create CloudFront distribution
    this.distribution = new cloudfront.Distribution(this, 'WebsiteDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    })

    // Grant CloudFront access to the S3 bucket
    this.bucket.grantRead(this.distribution.identity)

    // Deploy website content to S3
    new s3deploy.BucketDeployment(this, 'WebsiteDeployment', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../dist'))],
      destinationBucket: this.bucket,
      distribution: this.distribution,
      distributionPaths: ['/*'],
    })

    // Outputs
    new cdk.CfnOutput(this, 'BucketName', {
      value: this.bucket.bucketName,
      description: 'Name of the S3 bucket',
      exportName: `${id}-BucketName`,
    })

    new cdk.CfnOutput(this, 'CloudFrontDomain', {
      value: this.distribution.domainName,
      description: 'CloudFront distribution domain name',
      exportName: `${id}-CloudFrontDomain`,
    })

    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: `https://${this.distribution.domainName}`,
      description: 'CloudFront distribution URL',
      exportName: `${id}-CloudFrontURL`,
    })
  }
}
