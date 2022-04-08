import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type AttractionDocument = Attraction & mongoose.Document;

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
export class Attraction {
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
  avgRating: number;

  @Prop()
  description: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }])
  reviews: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Interest' })
  interest: mongoose.Schema.Types.ObjectId;

  @Prop()
  hours: number;

  @Prop()
  category: string;

  @Prop()
  price: number;

  @Prop()
  perks: string;

  @Prop()
  thumbnailSrc: string;

  @Prop()
  shares: string[];

  @Prop()
  likes: string[];
}

export const AttractionSchema = SchemaFactory.createForClass(Attraction);
