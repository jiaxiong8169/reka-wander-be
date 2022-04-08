import { Hotel } from 'src/schemas/hotel.schema';
import { Attraction } from 'src/schemas/attraction.schema';
import { Victual } from 'src/schemas/victual.schema';

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

  victuals: string[];

  hotels: string[];

  timestamp: Date;

  attractionObjects: Attraction[];

  victualObjects: Victual[];

  hotelObjects: Hotel[];
}
