import {
  KinesisClient,
  PutRecordsCommand,
  PutRecordsInput,
} from '@aws-sdk/client-kinesis';
import { randomUUID } from 'crypto';
import { Buffer } from 'buffer';
import { chunk } from 'lodash';
import { KinesisStreamRecord } from 'aws-lambda';

interface PutRecordsDataInput {
  data: string;
  partitionKey?: string;
}
interface PutRecordsDataOutput {
  failedPayloads: PutRecordsDataInput[];
}

export class KinesisAdapter {
  private static readonly BATCH_PUT_SIZE = 500;
  private readonly client: KinesisClient;

  public constructor(client?: KinesisClient) {
    this.client = client ?? new KinesisClient();
  }

  public async putRecords(
    streamArn: string,
    payloads: PutRecordsDataInput[],
  ): Promise<PutRecordsDataOutput> {
    const result: PutRecordsDataOutput = {
      failedPayloads: [],
    };
    try {
      for (const payloadsChunk of chunk(
        payloads,
        KinesisAdapter.BATCH_PUT_SIZE,
      )) {
        console.log(`Putting ${payloadsChunk.length} records`, { streamArn });

        const records = payloadsChunk.map(({ data, partitionKey }) => ({
          Data: Buffer.from(data, 'binary'),
          PartitionKey: partitionKey ?? randomUUID(),
        }));

        const input: PutRecordsInput = {
          Records: records,
          StreamARN: streamArn,
        };
        const command = new PutRecordsCommand(input);
        const response = await this.client.send(command);
        console.log('Result of put records', { streamArn, response });

        if (response.FailedRecordCount) {
          const failedRecords = (response.Records ?? [])
            .filter(({ ErrorCode }) => !!ErrorCode)
            .map((_, i) => payloadsChunk[i]);
          result.failedPayloads.push(...failedRecords);
        }
      }
      console.log('Parsed result of put records', { streamArn, result });
      return result;
    } catch (error) {
      throw error;
    }
  }

  public static parseInputEventRecords<T>(
    records: KinesisStreamRecord[],
    mapCallback?: (e: string) => T,
  ): T[] {
    try {
      const parsedRecords = records.map(({ kinesis: { data } }) =>
        Buffer.from(data, 'base64').toString('binary'),
      );

      const mappedRecords = mapCallback
        ? parsedRecords.map(mapCallback)
        : (parsedRecords as T[]);
      console.log(`Mapped ${mappedRecords.length} records`, { mappedRecords });
      return mappedRecords;
    } catch (error) {
      throw error;
    }
  }
}
