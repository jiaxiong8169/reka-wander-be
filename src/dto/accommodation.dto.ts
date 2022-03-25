export class AccommodationDto {
  name: string;

  city: string;

  loc: {
    type: { type: string };
    coordinates: [number];
  };

  rateCount: number;

  rateValue: number;

  description: string;

  comments: string[];

  recommenderFeatures: {
    maxPax: number;
    minBudget: number;
    interests: string[];
    kids: boolean;
    rentCar: boolean;
    rentHomestay: false;
  };

  durationHrs: number;

  category: string;

  normalMinPrice: number;

  discountMinPrice: number;

  perks: string;

  thumbnailSrc: string;

  shares: number;

  likes: number;
}
