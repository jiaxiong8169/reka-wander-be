export class CreateUserDto {
  name?: string;

  role?: string;

  email: string;

  password: string;

  phoneNumber?: string;

  comments?: string[];
}
