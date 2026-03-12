// SPDX-FileCopyrightText: 2024 CalmStudio contributors - see NOTICE file
//
// SPDX-License-Identifier: Apache-2.0

import type { PackDefinition, PackColor } from '../types.js';
import { awsIcons } from '../icons/aws.js';

const awsColor: PackColor = {
  bg: '#fff8f0',
  border: '#ff9900',
  stroke: '#e67e00',
  badge: '[AWS]',
};

function node(
  typeId: string,
  label: string,
  iconKey: string,
  description: string,
): PackDefinition['nodes'][number] {
  return {
    typeId,
    label,
    icon: awsIcons[iconKey] ?? awsIcons['ec2']!,
    color: awsColor,
    description,
  };
}

export const awsPack: PackDefinition = {
  id: 'aws',
  label: 'AWS',
  version: '1.0.0',
  color: awsColor,
  nodes: [
    node('aws:lambda', 'Lambda', 'lambda', 'Serverless function compute service'),
    node('aws:s3', 'S3', 's3', 'Scalable object storage service'),
    node('aws:dynamodb', 'DynamoDB', 'dynamodb', 'Managed NoSQL database service'),
    node('aws:ecs', 'ECS', 'ecs', 'Elastic Container Service for Docker workloads'),
    node('aws:eks', 'EKS', 'eks', 'Managed Kubernetes service'),
    node('aws:sqs', 'SQS', 'sqs', 'Simple Queue Service for message queuing'),
    node('aws:sns', 'SNS', 'sns', 'Simple Notification Service for pub/sub messaging'),
    node('aws:api-gateway', 'API Gateway', 'api-gateway', 'Managed API Gateway for REST and WebSocket APIs'),
    node('aws:rds', 'RDS', 'rds', 'Relational Database Service for managed SQL databases'),
    node('aws:aurora', 'Aurora', 'aurora', 'High-performance managed relational database'),
    node('aws:cloudfront', 'CloudFront', 'cloudfront', 'Content Delivery Network service'),
    node('aws:route53', 'Route 53', 'route53', 'Scalable DNS and domain registration service'),
    node('aws:iam', 'IAM', 'iam', 'Identity and Access Management for AWS resources'),
    node('aws:vpc', 'VPC', 'vpc', 'Virtual Private Cloud network isolation'),
    node('aws:ec2', 'EC2', 'ec2', 'Elastic Compute Cloud virtual machine service'),
    node('aws:fargate', 'Fargate', 'fargate', 'Serverless compute engine for containers'),
    node('aws:eventbridge', 'EventBridge', 'eventbridge', 'Serverless event bus for application integration'),
    node('aws:step-functions', 'Step Functions', 'step-functions', 'Serverless workflow orchestration service'),
    node('aws:cognito', 'Cognito', 'cognito', 'User authentication and identity management'),
    node('aws:elasticache', 'ElastiCache', 'elasticache', 'Managed in-memory caching service (Redis/Memcached)'),
    node('aws:kinesis', 'Kinesis', 'kinesis', 'Real-time data streaming and processing'),
    node('aws:redshift', 'Redshift', 'redshift', 'Managed petabyte-scale data warehouse'),
    node('aws:sagemaker', 'SageMaker', 'sagemaker', 'Managed machine learning platform'),
    node('aws:glue', 'Glue', 'glue', 'Serverless ETL and data integration service'),
    node('aws:secrets-manager', 'Secrets Manager', 'secrets-manager', 'Managed service for storing application secrets'),
    node('aws:cloudwatch', 'CloudWatch', 'cloudwatch', 'Monitoring and observability service'),
    node('aws:waf', 'WAF', 'waf', 'Web Application Firewall for traffic filtering'),
    node('aws:kms', 'KMS', 'kms', 'Key Management Service for encryption keys'),
    node('aws:elb', 'ELB', 'elb', 'Elastic Load Balancer for traffic distribution'),
    node('aws:efs', 'EFS', 'efs', 'Elastic File System for shared network storage'),
  ],
};
