import { ApiProperty } from '@nestjs/swagger';
import { Loc } from './loc.dto';
import { PackageDto } from './package.dto';

export class GuideDto {
  name: string;

  city: string;

  @ApiProperty({
    enum: Loc,
  })
  loc: Loc;

  description: string;

  interest: string;

  price: number;

  @ApiProperty({
    enum: PackageDto,
  })
  packages: PackageDto;

  thumbnailSrc: string;

  reviews: string[];

  rateCount: number;

  rateValue: number;

  avgRating: number;

  shares: string[];

  likes: string[];

  vendorName: string;

  vendorEmail: string;

  vendorPhoneNumber: string;

  timestamp: Date;
}
