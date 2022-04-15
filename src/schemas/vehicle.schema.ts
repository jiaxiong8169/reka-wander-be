import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type VehicleDocument = Vehicle & mongoose.Document;

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
export class Vehicle {
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

  @Prop()
  kids: boolean;

  @Prop()
  pax: number;

  @Prop()
  price: number;

  @Prop()
  priceWithBaby: number;

  @Prop()
  thumbnailSrc: string;

  @Prop()
  availability: number;

  @Prop()
  vendorName: string;

  @Prop()
  vendorEmail: string;

  @Prop()
  vendorPhoneNumber: string;

  @Prop()
  link: string;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
