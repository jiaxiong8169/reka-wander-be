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
export class Package {
  @Prop()
  name: string;

  @Prop()
  price: number;

  @Prop()
  hours: number;

  @Prop()
  location: string;
}

export const PackageSchema = SchemaFactory.createForClass(Package);
