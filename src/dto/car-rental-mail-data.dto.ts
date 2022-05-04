export class CarRentalMailDataDto {
  pickUpDate: Date;

  returnDate: Date;

  carLocation: string;

  carPrice: number;

  user: {
    email: string;
    phoneNumber: string;
  };
}
