import {
  DynamoDBClient,
  PutItemCommand,
  PutItemInput,
  BatchWriteItemCommand,
  BatchWriteItemInput,
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { chunk } from 'lodash';

export class DynamoDBAdapter {
  private static readonly BATCH_PUT_SIZE = 25;
  private readonly client: DynamoDBClient;

  public constructor(client?: DynamoDBClient) {
    this.client = client ?? new DynamoDBClient();
  }

  public async writeItem(
    tableName: string,
    data: Record<string, any>,
  ): Promise<void> {
    const item = marshall(data);
    const input: PutItemInput = {
      TableName: tableName,
      Item: item,
    };

    const command = new PutItemCommand(input);
    await this.client.send(command);
  }

  public async writeItems(
    tableName: string,
    data: Record<string, any>[],
  ): Promise<void> {
    try {
      for (const payloadsChunk of chunk(data, DynamoDBAdapter.BATCH_PUT_SIZE)) {
        const items = payloadsChunk.map((entry) => ({
          PutRequest: { Item: marshall(entry) },
        }));
        console.log(`Writting ${payloadsChunk.length} items`, {
          tableName,
          items,
        });

        const input: BatchWriteItemInput = {
          RequestItems: {
            [tableName]: items,
          },
        };

        const command = new BatchWriteItemCommand(input);
        await this.client.send(command);
      }
    } catch (error) {
      throw error;
    }
  }
}
