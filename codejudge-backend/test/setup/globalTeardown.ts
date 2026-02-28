import { readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { getContainerRuntimeClient } from 'testcontainers';

const CONTAINER_INFO_PATH = join(__dirname, '.mongo-container.json');

export default async function globalTeardown() {
  try {
    const { containerId } = JSON.parse(
      readFileSync(CONTAINER_INFO_PATH, 'utf-8'),
    );
    const containerRuntime = await getContainerRuntimeClient();
    const container = containerRuntime.container.getById(containerId);
    await containerRuntime.container.stop(container);
    unlinkSync(CONTAINER_INFO_PATH);
  } catch {
    // container may already be stopped
  }
}
