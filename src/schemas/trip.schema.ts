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

  @Prop({ required: true })
  previousBudget: number;

  @Prop()
  interests: string[];

  @Prop()
  kids: boolean;

  @Prop()
  rentCar: boolean;

  @Prop()
  rentHomestay: boolean;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Attraction' }])
  attractions: mongoose.Schema.Types.ObjectId[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }])
  restaurants: mongoose.Schema.Types.ObjectId[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }])
  hotels: mongoose.Schema.Types.ObjectId;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }])
  vehicles: mongoose.Schema.Types.ObjectId;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Homestay' }])
  homestays: mongoose.Schema.Types.ObjectId;

  @Prop()
  rooms: string[];

  @Prop({ required: true })
  timestamp: Date;
}

export const TripSchema = SchemaFactory.createForClass(Trip);
