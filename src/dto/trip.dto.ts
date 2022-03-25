export class TripDto {
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

  accommodations: string[];

  timestamp: Date;
}
