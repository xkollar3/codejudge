import { EventStore, EventStream, IEvent } from '@ocoda/event-sourcing';

export async function pollEvents(
  eventStore: EventStore<any>,
  stream: EventStream,
  expectedCount: number,
  timeoutMs = 10000,
): Promise<IEvent[]> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const events: IEvent[] = [];
    for await (const batch of eventStore.getEvents(stream)) {
      events.push(...batch);
    }
    if (events.length >= expectedCount) return events;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(
    `Timed out: expected ${expectedCount} events after ${timeoutMs}ms`,
  );
}
