import { Module } from '@nestjs/common';
import {
  MongoDBEventStore,
  MongoDBEventStoreConfig,
  MongoDBSnapshotStore,
  type MongoDBSnapshotStoreConfig,
} from '@ocoda/event-sourcing-mongodb';
import { EventSourcingModule } from '@ocoda/event-sourcing';

@Module({
  imports: [
    EventSourcingModule.forRootAsync<
      MongoDBEventStoreConfig,
      MongoDBSnapshotStoreConfig
    >({
      useFactory: () => ({
        events: [],
        eventStore: {
          driver: MongoDBEventStore,
          url: '',
          host: '<URL>',
          port: 5432,
          user: '<username>',
          password: '<password>',
          database: '<database>',
        },
        snapshotStore: {
          driver: MongoDBSnapshotStore,
          url: '<URL>',
        },
      }),
    }),
  ],
})
export class EventSourcingConfig {}
