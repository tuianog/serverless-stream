import { randomUUID } from "crypto";
import { KinesisAdapter } from "../src/adapter/kinesis";

(async () => {
    const streamArn = 'arn:aws:kinesis:eu-west-1:{accountId}:stream/serverless-stream-test';

    const kinesisAdapter = new KinesisAdapter();
    const N = 5;

    const getTestPayload = () => ({
        value: randomUUID(),
        date: new Date().toISOString(),
    });

    const items = new Array(N).fill(undefined).map((_) => ({data: JSON.stringify(getTestPayload())}));
    const r = await kinesisAdapter.putRecords(streamArn, items);
    console.log('result', {r});
})()