import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type InterestDocument = Interest & mongoose.Document;

@Schema({
  id: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      // switch _id to id
      ret.id = ret._id;
      delete ret._id;
    },
  },
})
export class Interest {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string;
}

export const InterestSchema = SchemaFactory.createForClass(Interest);
