import { CreateUserDto } from './create-user.dto';
import { GuideDto } from './guide.dto';
import { HomestayDto } from './homestay.dto';
import { HotelDto } from './hotel.dto';
import { PackageDto } from './package.dto';
import { RoomDto } from './room.dto';
import { VehicleDto } from './vehicle.dto';

export class CarRentalMailDataDto {
  pickUpDate: Date;

  returnDate: Date;

  carLocation: string;

  totalPrice: number;

  user: CreateUserDto;

  vehicle: VehicleDto;
}

export class HomestayMailDataDto {
  checkInDate: Date;

  checkOutDate: Date;

  location: string;

  totalPrice: number;

  user: CreateUserDto;

  homestay: HomestayDto;

  rooms: RoomDto[];
}

export class HotelMailDataDto {
  checkInDate: Date;

  checkOutDate: Date;

  location: string;

  totalPrice: number;

  user: CreateUserDto;

  hotel: HotelDto;

  rooms: RoomDto[];
}

export class GuideMailDataDto {
  startDate: Date;

  endDate: Date;

  location: string;

  totalPrice: number;

  user: CreateUserDto;

  guide: GuideDto;

  packages: PackageDto[];
}
