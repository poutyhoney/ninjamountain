terraform {
  required_version = ">= 1.10"

  backend "s3" {
    bucket       = "ninjamountain-tfstate-48781101"
    key          = "api-service/terraform.tfstate"
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

variable "image_tag" {
  description = "Tag of the API image in ECR to run (a git commit SHA)."
  type        = string
}

data "aws_caller_identity" "current" {}

data "aws_ecr_repository" "api" {
  name = "ninjamountain-api"
}

locals {
  api_token_parameter_arn     = "arn:aws:ssm:us-east-1:${data.aws_caller_identity.current.account_id}:parameter/ninjamountain/api/token"
  anthropic_key_parameter_arn = "arn:aws:ssm:us-east-1:${data.aws_caller_identity.current.account_id}:parameter/ninjamountain/api/anthropic-key"
}

resource "aws_ecs_cluster" "main" {
  name = "ninjamountain"
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/ninjamountain/api"
  retention_in_days = 7
}

resource "aws_iam_role" "execution" {
  name = "ninjamountain-api-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "execution" {
  role       = aws_iam_role.execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "execution_read_token" {
  name = "read-api-token"
  role = aws_iam_role.execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = "ssm:GetParameters"
      Resource = [
        local.api_token_parameter_arn,
        local.anthropic_key_parameter_arn,
      ]
    }]
  })
}

resource "aws_iam_role" "infrastructure" {
  name = "ninjamountain-api-infrastructure"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "infrastructure" {
  role       = aws_iam_role.infrastructure.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSInfrastructureRoleforExpressGatewayServices"
}

resource "aws_ecs_express_gateway_service" "api" {
  service_name            = "ninjamountain-api"
  cluster                 = aws_ecs_cluster.main.name
  execution_role_arn      = aws_iam_role.execution.arn
  infrastructure_role_arn = aws_iam_role.infrastructure.arn
  cpu                     = "256"
  memory                  = "512"
  health_check_path       = "/health"
  wait_for_steady_state   = true

  primary_container {
    image          = "${data.aws_ecr_repository.api.repository_url}:${var.image_tag}"
    container_port = 8000

    aws_logs_configuration {
      log_group         = aws_cloudwatch_log_group.api.name
      log_stream_prefix = "api"
    }

    environment {
      name  = "APP_VERSION"
      value = var.image_tag
    }

    environment {
      name  = "LOG_LEVEL"
      value = "INFO"
    }

    environment {
      name  = "CORS_ORIGINS"
      value = "https://ninjamountain-store.vercel.app"
    }

    secret {
      name       = "API_TOKEN"
      value_from = local.api_token_parameter_arn
    }

    secret {
      name       = "ANTHROPIC_API_KEY"
      value_from = local.anthropic_key_parameter_arn
    }
  }

  scaling_target {
    auto_scaling_metric       = "AVERAGE_CPU"
    auto_scaling_target_value = 60
    min_task_count            = 1
    max_task_count            = 1
  }

  depends_on = [
    aws_iam_role_policy_attachment.execution,
    aws_iam_role_policy.execution_read_token,
    aws_iam_role_policy_attachment.infrastructure,
  ]
}

output "api_url" {
  value = aws_ecs_express_gateway_service.api.ingress_paths[0].endpoint
}

data "aws_sns_topic" "alerts" {
  name = "ninjamountain-alerts"
}

resource "aws_cloudwatch_log_metric_filter" "api_5xx" {
  name           = "ninjamountain-api-5xx"
  log_group_name = aws_cloudwatch_log_group.api.name
  pattern        = "{ $.status >= 500 }"

  metric_transformation {
    name          = "Api5xxCount"
    namespace     = "Ninjamountain/Api"
    value         = "1"
    default_value = "0"
  }
}

resource "aws_cloudwatch_metric_alarm" "api_5xx" {
  alarm_name          = "ninjamountain-api-5xx"
  alarm_description   = "The API returned at least one 5xx response in the last minute."
  namespace           = "Ninjamountain/Api"
  metric_name         = "Api5xxCount"
  statistic           = "Sum"
  period              = 60
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [data.aws_sns_topic.alerts.arn]
  ok_actions          = [data.aws_sns_topic.alerts.arn]
}