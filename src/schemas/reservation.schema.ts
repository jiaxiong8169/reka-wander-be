import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type ReservationDocument = Reservation & mongoose.Document;

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
export class Reservation {
  _id: mongoose.Schema.Types.ObjectId;

  // @Prop({ required: true })
  // targetId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, refPath: 'type' })
  targetId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop()
  timestamp: Date;

  // @Prop()
  // type: string;

  @Prop({
    type: String,
    required: true,
    enum: ['Hotel', 'Homestay', 'Guide', 'Vehicle']
  })

  type: string;

  @Prop()
  reservedName: string;

  // @Prop()
  // selectedItems: string[];

  @Prop()
  roomId: string;

  @Prop()
  packageId: string;

  @Prop()
  totalPrice: number;

  @Prop()
  status: string;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);
