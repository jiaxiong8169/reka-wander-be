import { bedType } from './bedType';
export class RoomDto {
  price: number;

  priceWithBaby: number;

  pax: number;

  thumbnailSrc: string;

  availability: number;

  quantity: number;

  bedTypes: bedType;
}
