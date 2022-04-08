// `_id` should not be included here
export const SEARCH_FIELDS = {
  users: ['name.eng', 'name.cht', 'name.chs'],
  reviews: ['userName', 'contents'],
  trips: ['name'],
  interests: ['name'],
  attractions: ['name', 'city', 'category', 'perks'],
  restaurants: ['name', 'city', 'category', 'perks'],
  hotels: ['name', 'city', 'category', 'perks'],
  homestays: ['name', 'city'],
  vehicles: ['name', 'city'],
  guides: ['name', 'city'],
};
