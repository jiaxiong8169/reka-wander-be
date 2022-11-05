export class ReservationDto {
  id: string;
  
  userId: string;

  timestamp: Date;

  type: string;

  typeName: string;

  selected: string[];

  processed: boolean;

  startDate: Date;

  endDate: Date;
}
