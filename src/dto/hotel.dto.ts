import { ApiProperty } from '@nestjs/swagger';
import { FacilityType } from './facilityType';
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
  
  propertyType: string;

  parkingFee: number;

  parkingNumber: number;

  checkInTime: string;

  checkOutTime: string;

  additionalRules: string[];

  timestamp: Date;
  
  facilities: FacilityType;
}

// interface FacilitiesType{
//   [key: string]: string | number;

// }
