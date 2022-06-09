import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { RoomSchema, Room } from './room.schema';

export type HomestayDocument = Homestay & mongoose.Document;

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
export class Homestay {
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
  description: string;

  @Prop()
  kids: boolean;

  @Prop([{ type: RoomSchema }])
  rooms: Room[];

  @Prop()
  thumbnailSrc: string;

  @Prop()
  vendorName: string;

  @Prop()
  vendorEmail: string;

  @Prop()
  vendorPhoneNumber: string;

  @Prop()
  link: string;
}

export const HomestaySchema = SchemaFactory.createForClass(Homestay);
