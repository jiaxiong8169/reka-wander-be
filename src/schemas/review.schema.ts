import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type ReviewDocument = Review & mongoose.Document;

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
export class Review {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  targetId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  userName: string;

  @Prop()
  userProfileSrc: string;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true })
  contents: string;

  @Prop({ required: true })
  rating: number;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
