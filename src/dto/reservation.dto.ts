export class ReservationDto {
  targetId: string;
  
  userId: string;

  timestamp: Date;

  type: string;

  reservedName: string;

  totalPrice: number;

  selectedItems: string[];

  isDone: boolean;

  startDate: Date;

  endDate: Date;
}
