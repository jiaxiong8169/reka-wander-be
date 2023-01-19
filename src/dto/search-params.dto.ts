export class SearchQueryDto {
  sort?: string;
  filter?: { [key: string]: string };
  offset?: number;
  limit?: number;
}
