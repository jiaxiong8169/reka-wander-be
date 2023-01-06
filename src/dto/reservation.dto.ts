export class ReservationDto {
  targetId: string;
  
  userId: string;

  timestamp: Date;

  type: string;

  reservedName: string;

  totalPrice: number;

  selectedItems: string[];

  status: string;

  startDate: Date;

  endDate: Date;
}
