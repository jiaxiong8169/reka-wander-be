import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { FacilityType } from 'src/dto/facilityType';
import { RoomSchema, Room } from './room.schema';

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
  minPrice: number;

  @Prop()
  maxPrice: number;

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

  @Prop()
  kids: boolean;

  @Prop([{ type: RoomSchema }])
  rooms: Room[];

  @Prop()
  category: string;

  @Prop()
  perks: string;

  @Prop()
  thumbnailSrc: string;

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
  link: string;

  @Prop()
  parkingFee: number;

  @Prop()
  parkingNumber: number;

  @Prop()
  checkInTime: string;

  @Prop()
  checkOutTime: string;

  @Prop()
  additionalRules: string[];

  @Prop({ required: true })
  timestamp: Date;

  @Prop(raw(FacilityType))
  facilities: FacilityType;
}

// interface FacilitiesType{
//   [key: string]: string | number;
// }

export const HotelSchema = SchemaFactory.createForClass(Hotel);
