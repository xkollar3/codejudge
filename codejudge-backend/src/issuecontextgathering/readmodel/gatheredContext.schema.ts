import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'read_gathered_contexts' })
export class GatheredContext {
  @Prop({ required: true, unique: true })
  aggregateId: string;

  @Prop(raw({ title: String, description: String }))
  issue?: { title: string; description: string };

  @Prop(
    raw([
      {
        url: String,
        description: String,
        comments: [String],
        diffs: raw({
          baseSha: String,
          headSha: String,
          changedFiles: [
            raw({
              filename: String,
              linesAdded: Number,
              linesRemoved: Number,
              fileBefore: String,
              fileAfter: String,
            }),
          ],
        }),
      },
    ]),
  )
  pullRequests?: Array<{
    url: string;
    description: string;
    comments: string[];
    diffs?: {
      baseSha: string;
      headSha: string;
      changedFiles: Array<{
        filename: string;
        linesAdded: number;
        linesRemoved: number;
        fileBefore: string | null;
        fileAfter: string | null;
      }>;
    };
  }>;
}

export type GatheredContextDocument = HydratedDocument<GatheredContext>;
export const GatheredContextSchema =
  SchemaFactory.createForClass(GatheredContext);
