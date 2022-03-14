import * as mongoose from 'mongoose';

export class UpdateUserDto {
  name?: string;

  role?: string;

  email?: string;

  password?: string;

  phoneNumber?: string;
}
