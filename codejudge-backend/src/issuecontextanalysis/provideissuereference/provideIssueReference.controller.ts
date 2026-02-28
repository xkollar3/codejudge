import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { CommandBus } from '@ocoda/event-sourcing';
import { UUID } from 'crypto';
import { type IssueTrackerType } from '../aggregate/IssueContext';
import { ProvideIssueReferenceCommand } from './provideIssueReferenceCommand';
import { IsNotEmpty } from 'class-validator';

class ProvideIssueContextRequest {
  @IsNotEmpty()
  public readonly trackerType: IssueTrackerType;
  @IsNotEmpty()
  public readonly issueUrl: string;
}

type ProvideIssueContextResponse = {
  id: UUID;
};

@Controller('issue-context')
export class ProvideIssueContextController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @HttpCode(201)
  async issueContext(
    @Body() request: ProvideIssueContextRequest,
  ): Promise<ProvideIssueContextResponse> {
    Logger.log(
      `Post new issue context: ${request.issueUrl} on tracker: ${request.trackerType}`,
    );

    const id: UUID = await this.commandBus.execute(
      new ProvideIssueReferenceCommand(request.trackerType, request.issueUrl),
    );

    return { id };
  }
}
