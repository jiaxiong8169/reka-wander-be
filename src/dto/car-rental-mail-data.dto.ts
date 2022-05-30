import { CreateUserDto } from './create-user.dto';
import { VehicleDto } from './vehicle.dto';

export class CarRentalMailDataDto {
  pickUpDate: Date;

  returnDate: Date;

  carLocation: string;

  totalPrice: number;

  user: CreateUserDto;

  vehicle: VehicleDto;
}
