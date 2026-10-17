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