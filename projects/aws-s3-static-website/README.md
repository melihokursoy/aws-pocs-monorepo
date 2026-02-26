# AWS S3 Static Website Deployment

A React + TypeScript + Vite application deployed to AWS S3 with CloudFront CDN using AWS CDK.

## Architecture

This POC demonstrates:
- **Frontend**: React 18 + TypeScript + Vite for fast development and optimized builds
- **Storage**: S3 bucket for static content with versioning and encryption
- **CDN**: CloudFront distribution for fast content delivery and HTTPS
- **Infrastructure**: AWS CDK for infrastructure as code deployment

### AWS Resources

- **S3 Bucket**: Stores static website assets (HTML, CSS, JS, images)
- **CloudFront Distribution**: CDN that caches content and provides HTTPS
- **S3 Deployment**: Automated deployment of build artifacts to S3

## Prerequisites

- Node.js 18+ (check with `node --version`)
- pnpm 8+ (`npm install -g pnpm`)
- AWS CLI configured with credentials (`aws configure`)
- AWS CDK CLI (`npm install -g aws-cdk`)

## Project Structure

```
aws-s3-static-website/
├── src/                      # React application
│   ├── main.tsx             # Entry point
│   ├── App.tsx              # Main component
│   ├── App.css              # App styles
│   └── index.css            # Global styles
├── cdk/                     # CDK infrastructure
│   ├── bin/
│   │   └── app.ts          # CDK app definition
│   └── lib/
│       └── s3-static-site-stack.ts  # Stack definition
├── dist/                    # Build output (generated)
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## Development

### Install dependencies

```bash
cd projects/aws-s3-static-website
pnpm install
```

### Local development

```bash
pnpm dev
```

This starts a local development server at `http://localhost:3000` with hot module replacement (HMR).

### Build for production

```bash
pnpm build
```

This creates an optimized production build in the `dist/` directory.

### Preview production build

```bash
pnpm preview
```

This serves the production build locally for testing.

## Deployment

### Prerequisites

1. **AWS Account**: You need an AWS account with appropriate permissions
2. **AWS Credentials**: Configure AWS CLI with your credentials:
   ```bash
   aws configure
   ```
3. **Bootstrap CDK** (first time only):
   ```bash
   cdk bootstrap aws://YOUR_ACCOUNT_ID/us-east-1
   ```

### Deploy to AWS

```bash
# Build the React application
pnpm build

# Deploy using CDK
pnpm cdk:deploy
```

The deployment will:
1. Create an S3 bucket with encryption and versioning
2. Create a CloudFront distribution for CDN
3. Upload the built assets to S3
4. Invalidate CloudFront cache

### Deployment output

After deployment, you'll see outputs like:
```
S3StaticSiteStack.BucketName = aws-s3-static-website-123456789012-us-east-1
S3StaticSiteStack.CloudFrontURL = https://d1234567890.cloudfront.net
```

Visit the CloudFront URL to see your website!

## CDK Commands

```bash
# View the CloudFormation template
pnpm cdk:synth

# View differences between current and deployed stack
pnpm cdk:diff

# Destroy the stack and all resources
pnpm cdk:destroy
```

## Clean Up

To avoid incurring AWS charges, destroy all resources when done:

```bash
pnpm cdk:destroy
```

This will:
- Delete the CloudFront distribution
- Delete the S3 bucket and all contents
- Remove all other AWS resources

**Warning**: This action cannot be undone. Make sure you want to delete everything before running this command.

## Cost Estimation

- **S3 Storage**: ~$0.023 per GB/month
- **CloudFront**: ~$0.085 per GB (varies by region)
- **Data Transfer**: Free for first 1GB/month

For a small website, costs should be minimal (often less than $1/month).

## Environment Variables

Create a `.env.local` file for local development (not committed to git):

```
VITE_API_URL=https://api.example.com
```

Reference in your code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

## Troubleshooting

### CloudFront shows 403 error

- Ensure CloudFront has permission to read the S3 bucket (handled by CDK)
- Check S3 bucket policy includes CloudFront Origin Access Control

### Deployment fails with permission error

- Verify AWS credentials are configured: `aws sts get-caller-identity`
- Ensure your AWS user has permissions for S3, CloudFront, and IAM

### Changes not visible after deployment

- CloudFront caches content. CDK automatically invalidates the cache, but you can manually:
  ```bash
  aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"
  ```

## References

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [CloudFront Caching](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/caching.html)
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

## Next Steps

- Add custom domain with Route 53
- Add SSL/TLS certificate with ACM
- Implement CI/CD pipeline with GitHub Actions
- Add monitoring with CloudWatch
- Set up access logging for S3 and CloudFront
