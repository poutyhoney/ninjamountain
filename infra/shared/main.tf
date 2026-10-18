terraform {
  required_version = ">= 1.10"

  backend "s3" {
    bucket       = "ninjamountain-tfstate-48781101"
    key          = "shared/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      Project   = "ninjamountain"
      ManagedBy = "terraform"
    }
  }
}

resource "aws_ecr_repository" "api" {
  name                 = "ninjamountain-api"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "api" {
  repository = aws_ecr_repository.api.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep the 10 most recent images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

output "ecr_repository_url" {
  value = aws_ecr_repository.api.repository_url
}

variable "alert_email" {
  description = "Email address that receives alarm notifications."
  type        = string
}

resource "aws_sns_topic" "alerts" {
  name = "ninjamountain-alerts"
}

resource "aws_sns_topic_subscription" "alert_email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

output "alerts_topic_arn" {
  value = aws_sns_topic.alerts.arn
}

data "aws_caller_identity" "current" {}

locals {
  account_id   = data.aws_caller_identity.current.account_id
  state_bucket = "ninjamountain-tfstate-48781101"
}

resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}

resource "aws_iam_role" "github_deploy" {
  name = "ninjamountain-github-deploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = aws_iam_openid_connect_provider.github.arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          "token.actions.githubusercontent.com:sub" = "repo:poutyhoney/ninjamountain:ref:refs/heads/main"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "github_deploy" {
  name = "deploy-api"
  role = aws_iam_role.github_deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "EcrLogin"
        Effect   = "Allow"
        Action   = "ecr:GetAuthorizationToken"
        Resource = "*"
      },
      {
        Sid    = "EcrPushApiImage"
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage",
          "ecr:BatchGetImage",
          "ecr:DescribeImages",
          "ecr:DescribeRepositories",
          "ecr:ListTagsForResource",
        ]
        Resource = aws_ecr_repository.api.arn
      },
      {
        Sid      = "TerraformStateList"
        Effect   = "Allow"
        Action   = "s3:ListBucket"
        Resource = "arn:aws:s3:::${local.state_bucket}"
      },
      {
        Sid      = "TerraformStateApiService"
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = "arn:aws:s3:::${local.state_bucket}/api-service/*"
      },
      {
        Sid    = "ReadApiServiceResources"
        Effect = "Allow"
        Action = [
          "ecs:DescribeClusters",
          "ecs:DescribeServices",
          "ecs:DescribeExpressGatewayService",
          "ecs:ListTagsForResource",
          "logs:DescribeLogGroups",
          "logs:DescribeMetricFilters",
          "logs:ListTagsForResource",
          "logs:ListTagsLogGroup",
          "cloudwatch:DescribeAlarms",
          "cloudwatch:ListTagsForResource",
          "sns:ListTopics",
          "sns:GetTopicAttributes",
          "sns:ListTagsForResource",
        ]
        Resource = "*"
      },
      {
        Sid    = "ReadApiServiceRoles"
        Effect = "Allow"
        Action = [
          "iam:GetRole",
          "iam:GetRolePolicy",
          "iam:ListRolePolicies",
          "iam:ListAttachedRolePolicies",
        ]
        Resource = "arn:aws:iam::${local.account_id}:role/ninjamountain-api-*"
      },
      {
        Sid      = "UpdateApiServiceImage"
        Effect   = "Allow"
        Action   = "ecs:UpdateExpressGatewayService"
        Resource = "arn:aws:ecs:us-east-1:${local.account_id}:service/ninjamountain/ninjamountain-api"
      },
      {
        Sid      = "PassApiExecutionRole"
        Effect   = "Allow"
        Action   = "iam:PassRole"
        Resource = "arn:aws:iam::${local.account_id}:role/ninjamountain-api-execution"
      },
    ]
  })
}

output "github_deploy_role_arn" {
  value = aws_iam_role.github_deploy.arn
}