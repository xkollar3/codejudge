import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import {
  MongoDBEventStore,
  MongoDBEventStoreConfig,
  MongoDBSnapshotStore,
  type MongoDBSnapshotStoreConfig,
} from '@ocoda/event-sourcing-mongodb';
import { EventSourcingModule } from '@ocoda/event-sourcing';
import { HealthController } from './health.controller';
import { MongoDBHealthIndicator } from './mongodb.health';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TerminusModule,
    EventSourcingModule.forRootAsync<
      MongoDBEventStoreConfig,
      MongoDBSnapshotStoreConfig
    >({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        events: [],
        eventStore: {
          driver: MongoDBEventStore,
          url: configService.getOrThrow<string>('MONGODB_URL'),
        },
        snapshotStore: {
          driver: MongoDBSnapshotStore,
          url: configService.getOrThrow<string>('MONGODB_URL'),
        },
      }),
    }),
  ],
  exports: [EventSourcingModule],
  controllers: [HealthController],
  providers: [MongoDBHealthIndicator],
})
export class SharedModule {}
