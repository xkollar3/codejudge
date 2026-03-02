import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GatheredContext } from './gatheredContext.schema';

@Controller('issue-context')
export class GatheredContextController {
  constructor(
    @InjectModel(GatheredContext.name)
    private readonly model: Model<GatheredContext>,
  ) {}

  @Get(':id')
  async getGatheredContext(@Param('id') id: string) {
    const doc = await this.model.findOne({ aggregateId: id }).lean();
    if (!doc) {
      throw new NotFoundException(`No gathered context found for ${id}`);
    }
    return {
      aggregateId: doc.aggregateId,
      issue: doc.issue,
      pullRequests: doc.pullRequests,
    };
  }
}
