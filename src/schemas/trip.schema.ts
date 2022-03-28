import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type TripDocument = Trip & mongoose.Document;

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
export class Trip {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }])
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  pax: number;

  @Prop({ required: true })
  budget: number;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Interest' }])
  interests: mongoose.Schema.Types.ObjectId[];

  @Prop()
  kids: boolean;

  @Prop()
  rentCar: boolean;

  @Prop()
  rentHomestay: boolean;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Attraction' }])
  attractions: mongoose.Schema.Types.ObjectId[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Victual' }])
  victuals: mongoose.Schema.Types.ObjectId[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Accommodation' }])
  accommodations: mongoose.Schema.Types.ObjectId[];

  @Prop({ required: true })
  timestamp: Date;
}

export const TripSchema = SchemaFactory.createForClass(Trip);
