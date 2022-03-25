import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type VictualDocument = Victual & mongoose.Document;

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
export class Victual {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  city: string;

  @Prop(
    raw({
      type: { type: String },
      coordinates: [Number],
    }),
  )
  loc: Record<string, any>;

  @Prop()
  rateCount: number;

  @Prop()
  rateValue: number;

  @Prop()
  description: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }])
  comments: mongoose.Schema.Types.ObjectId[];

  @Prop(
    raw({
      maxPax: Number,
      minBudget: Number,
      interests: [String],
      kids: Boolean,
      rentCar: Boolean,
      rentHomestay: Boolean,
    }),
  )
  recommenderFeatures: Record<string, any>;

  @Prop()
  durationHrs: number;

  @Prop()
  category: string;

  @Prop()
  normalMinPrice: number;

  @Prop()
  discountMinPrice: number;

  @Prop()
  perks: string;

  @Prop()
  thumbnailSrc: string;

  @Prop()
  shares: number;

  @Prop()
  likes: number;
}

export const VictualSchema = SchemaFactory.createForClass(Victual);
