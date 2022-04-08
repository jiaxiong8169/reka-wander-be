import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Package, PackageSchema } from './package.schema';

export type HotelDocument = Hotel & mongoose.Document;

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
export class Hotel {
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
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Interest' })
  interest: mongoose.Schema.Types.ObjectId;

  @Prop()
  price: number;

  @Prop([{ type: PackageSchema }])
  packages: Package;

  @Prop()
  thumbnailSrc: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }])
  reviews: mongoose.Schema.Types.ObjectId[];

  @Prop()
  rateCount: number;

  @Prop()
  rateValue: number;

  @Prop()
  avgRating: number;

  @Prop()
  shares: string[];

  @Prop()
  likes: string[];

  @Prop()
  vendorName: string;

  @Prop()
  vendorEmail: string;

  @Prop()
  vendorPhoneNumber: string;

  @Prop()
  timestamp: Date;
}

export const HotelSchema = SchemaFactory.createForClass(Hotel);
