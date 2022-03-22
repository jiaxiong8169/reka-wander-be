import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Role } from 'src/auth/roles.decorator';

export type UserDocument = User & mongoose.Document;

@Schema({
  id: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      // switch _id to id
      ret.id = ret._id;
      delete ret._id;

      // remove sensitive fields
      delete ret.password;
      delete ret.currentHashedRefreshToken;
    },
  },
})
export class User {
  _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  name: string;

  @Prop({ default: 'user', lowercase: true, required: true, minLength: 1 })
  role: Role;

  // each role has a predefined set of permissions, see `permission.enum`
  // `permissions` extends the role's permissions
  // `permissions` field will be added the predefined set of permissions
  @Prop({ required: false })
  permissions: string[];

  @Prop({
    required: true,
    unique: true,
    match: /\S+@{1}\S+/i,
    lowercase: true,
    minLength: 1,
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  currentHashedRefreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
