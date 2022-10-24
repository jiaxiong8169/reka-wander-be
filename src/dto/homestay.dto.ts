import { ApiProperty } from '@nestjs/swagger';
import { Loc } from './loc.dto';
import { RoomDto } from './room.dto';

export class HomestayDto {
  name: string;

  city: string;

  @ApiProperty({
    enum: Loc,
  })
  loc: Loc;

  minPrice: number;

  maxPrice: number;

  description: string;

  kids: boolean;

  @ApiProperty({
    enum: [RoomDto],
  })
  rooms: RoomDto[];

  thumbnailSrc: string;

  vendorName: string;

  vendorEmail: string;

  vendorPhoneNumber: string;

  link: string;

  propertyType: string;

  parkingFee: number;

  checkInTime: string;

  checkOutTime: string;

  additionalRules: string[];

  amenities: string[];
}
