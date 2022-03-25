import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type RateDocument = Rate & mongoose.Document;

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
export class Rate {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  spotId: string;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true })
  value: number;
}

export const RateSchema = SchemaFactory.createForClass(Rate);
