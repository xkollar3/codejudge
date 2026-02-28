import { Injectable } from '@nestjs/common';

@Injectable()
export class IssueContextRepository {
  constructor(private readonly eventStore: EventStore) {}
}
