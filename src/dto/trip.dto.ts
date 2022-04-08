import { Hotel } from 'src/schemas/hotel.schema';
import { Attraction } from 'src/schemas/attraction.schema';
import { Restaurant } from 'src/schemas/restaurant.schema';
import { Vehicle } from 'src/schemas/vehicle.schema';
import { Homestay } from 'src/schemas/homestay.schema';
import { Room } from 'src/schemas/room.schema';

export class TripDto {
  id: string;

  userId: string;

  name: string;

  startDate: Date;

  endDate: Date;

  pax: number;

  budget: number;

  interests: string[];

  kids: boolean;

  rentCar: boolean;

  rentHomestay: boolean;

  attractions: string[];

  restaurants: string[];

  hotel: string;

  vehicle: string;

  homestay: string;

  rooms: string[];

  timestamp: Date;

  attractionObjects: Attraction[];

  restaurantObjects: Restaurant[];

  hotelObject: Hotel;

  vehicleObject: Vehicle;

  homestayObject: Homestay;

  roomObjects: Room[];
}
