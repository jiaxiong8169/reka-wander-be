import { ApiProperty } from '@nestjs/swagger';
import { Loc } from './loc.dto';
import { RoomDto } from './room.dto';

export class HotelDto {
  name: string;

  city: string;

  @ApiProperty({
    enum: Loc,
  })
  loc: Loc;

  minPrice: number;

  maxPrice: number;

  rateCount: number;

  rateValue: number;

  avgRating: number;

  description: string;

  reviews: string[];

  kids: boolean;

  @ApiProperty({
    enum: [RoomDto],
  })
  rooms: RoomDto[];

  category: string;

  perks: string;

  thumbnailSrc: string;

  shares: string[];

  likes: string[];

  vendorName: string;

  vendorEmail: string;

  vendorPhoneNumber: string;

  link: string;
}
