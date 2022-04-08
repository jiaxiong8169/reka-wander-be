import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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
  thumbnailSrc: string;

  @Prop()
  availability: number;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
