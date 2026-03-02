import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { CommandBus, UUID } from '@ocoda/event-sourcing';
import { type IssueTrackerType } from '../../events';
import { ProvideIssueReferenceCommand } from './provideIssueReferenceCommand';
import { IsNotEmpty } from 'class-validator';

class ProvideIssueContextRequest {
  @IsNotEmpty()
  public readonly trackerType: IssueTrackerType;
  @IsNotEmpty()
  public readonly issueUrl: string;
}

type ProvideIssueContextResponse = {
  id: string;
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

    return { id: id.value };
  }
}
