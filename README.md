# serverless-stream

## Description

This project implements a simple Kinesis Data Stream consumer using a Lambda trigger and writting parsed records to a DynamoDB table. SAM is used for packaging and deploying using CloudFormation.

`tests.dispatcher.ts` is a script to dispatch records to a given Data stream.

### Resouces:

- Kinesis Data Stream
- Lambda
- DynamoDB table

### Package and Install

> npm run build

> sam build

> sam deploy


### Dispatch messages

Update target stream ARN accordingly and then:
> npx ts-node scripts/dispatcher.ts

### Infrastructure cleanup:
> sam delete