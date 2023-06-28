#!/bin/bash

aws configure set aws_access_key_id root --profile custom \
    && aws configure set aws_secret_access_key root --profile custom \
    && aws configure set default.region us-east-1 --profile custom \
    && aws configure set output json --profile custom
    
aws --profile custom \
    --endpoint-url http://localhost:4566 \
    s3api create-bucket \
    --bucket demo-bucket

aws --profile custom \
    --endpoint-url http://localhost:4566 \
    s3api put-bucket-acl \
    --bucket demo-bucket \
    --acl public-read
    
aws --profile custom \
    --endpoint-url http://localhost:4566 \
    s3 sync "/tmp/localstack" "s3://demo-bucket"
