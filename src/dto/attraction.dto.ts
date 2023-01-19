import { ApiProperty } from '@nestjs/swagger';
import { Loc } from './loc.dto';

export class AttractionDto {
  name: string;

  city: string;

  @ApiProperty({
    enum: Loc,
  })
  loc: Loc;

  rateCount: number;

  rateValue: number;

  avgRating: number;

  description: string;

  reviews: string[];

  interest: string;

  hours: number;

  category: string;

  price: number;

  perks: string;

  thumbnailSrc: string;

  shares: string[];

  likes: string[];

  link: string;

  timestamp: Date;
}
