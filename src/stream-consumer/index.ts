import { Handler, KinesisStreamEvent } from 'aws-lambda';
import { KinesisAdapter } from '../adapter/kinesis';
import { DynamoDBAdapter } from '../adapter/dynamodb';
import { randomUUID } from 'crypto';

const TABLE_NAME = process.env.tableName as string;

export const handler: Handler = async (
  event: KinesisStreamEvent,
  context: Record<string, any>,
): Promise<void> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));

  // 1 - deserialize stream records
  const parsedRecords = KinesisAdapter.parseInputEventRecords<
    Record<string, any>
  >(event.Records, (e) => JSON.parse(e));
  
  // 2 - write parsed items
  const items = parsedRecords.map((record) => ({
    ...record,
    id: randomUUID(),
  }));
  await new DynamoDBAdapter().writeItems(TABLE_NAME, items);
};
