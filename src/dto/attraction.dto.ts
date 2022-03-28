import { ApiProperty } from '@nestjs/swagger';
import { Loc } from './loc.dto';
import { RecommenderFeatures } from './recommender-features.dto';

export class AttractionDto {
  name: string;

  city: string;

  @ApiProperty({
    enum: Loc,
  })
  loc: Loc;

  rateCount: number;

  rateValue: number;

  description: string;

  comments: string[];

  @ApiProperty({
    enum: RecommenderFeatures,
  })
  recommenderFeatures: RecommenderFeatures;

  durationHrs: number;

  category: string;

  normalMinPrice: number;

  discountMinPrice: number;

  perks: string;

  thumbnailSrc: string;

  shares: number;

  likes: number;
}
