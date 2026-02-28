import { MongoDBContainer } from '@testcontainers/mongodb';
import { writeFileSync } from 'fs';
import { join } from 'path';

const CONTAINER_INFO_PATH = join(__dirname, '.mongo-container.json');

export default async function globalSetup() {
  const container = await new MongoDBContainer('mongo:8').start();
  const url = container.getConnectionString() + '?directConnection=true';
  process.env.MONGODB_URL = url;

  writeFileSync(
    CONTAINER_INFO_PATH,
    JSON.stringify({ containerId: container.getId(), url }),
  );
}
