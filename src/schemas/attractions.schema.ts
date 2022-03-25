import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type AttractionsDocument = Attractions & mongoose.Document;

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
export class Attractions {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  city: string;

  @Prop({ index: '2dsphere' })
  loc: {
    type: { type: string };
    coordinates: [number];
  };

  @Prop()
  rateCount: number;

  @Prop()
  rateValue: number;

  @Prop()
  description: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }])
  comments: mongoose.Schema.Types.ObjectId[];

  @Prop()
  recommenderFeatures: {
    maxPax: number;
    minBudget: number;
    interests: string[];
    kids: boolean;
    rentCar: boolean;
    rentHomestay: false;
  };

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

export const AttractionsSchema = SchemaFactory.createForClass(Attractions);
