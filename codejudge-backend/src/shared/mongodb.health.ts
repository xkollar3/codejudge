import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { MongoClient } from 'mongodb';

@Injectable()
export class MongoDBHealthIndicator extends HealthIndicator {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const url = this.configService.getOrThrow<string>('MONGODB_URL');
    const client = new MongoClient(url, { serverSelectionTimeoutMS: 2000 });

    try {
      await client.connect();
      await client.db().command({ ping: 1 });
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError('MongoDB check failed', this.getStatus(key, false));
    } finally {
      await client.close();
    }
  }
}
