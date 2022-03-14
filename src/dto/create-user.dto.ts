import * as mongoose from 'mongoose';

export class CreateUserDto {
  name?: string;

  role?: string;

  email: string;

  password: string;

  phoneNumber?: string;
}
