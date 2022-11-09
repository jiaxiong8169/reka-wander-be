import { ApiProperty } from '@nestjs/swagger';
import { Loc } from './loc.dto';

export class VehicleDto {
  name: string;

  city: string;

  @ApiProperty({
    enum: Loc,
  })
  loc: Loc;

  description: string;

  kids: boolean;

  pax: number;

  price: number;

  priceWithBaby: number;

  thumbnailSrc: string;

  availability: number;

  vendorName: string;

  vendorEmail: string;

  vendorPhoneNumber: string;

  link: string;

  transmission: string;
  seatNumber: number;

  type: string;

  additionalRules: string[];

  timestamp: Date;
}
