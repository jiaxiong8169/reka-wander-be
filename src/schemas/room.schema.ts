import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { bedType } from 'src/dto/bedType';

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
export class Room {
  @Prop()
  price: number;

  @Prop()
  priceWithBaby: number;

  @Prop()
  pax: number;

  @Prop()
  thumnailSrc: string;

  @Prop()
  availability: number;

  @Prop(raw(bedType))
  bedTypes: bedType;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
