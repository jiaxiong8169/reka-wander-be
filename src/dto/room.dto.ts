import { bedType } from './bedType';
export class RoomDto {
  price: number;

  priceWithBaby: number;

  pax: number;

  thumnailSrc: string;

  availability: number;

  quantity: number;

  bedTypes: bedType;
}
