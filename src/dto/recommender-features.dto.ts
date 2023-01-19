export class RecommenderFeatures {
  public constructor(init?: Partial<RecommenderFeatures>) {
    Object.assign(this, init);
  }

  maxPax: number;
  minBudget: number;
  interests: string[];
  kids: boolean;
  rentCar: boolean;
  rentHomestay: boolean;
}
