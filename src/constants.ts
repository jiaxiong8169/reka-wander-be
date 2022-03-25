// `_id` should not be included here
export const SEARCH_FIELDS = {
  users: ['name.eng', 'name.cht', 'name.chs'],
  comments: ['userName', 'contents'],
  trips: ['name'],
  interests: ['name'],
  attractions: ['name', 'city', 'category', 'perks'],
  victuals: ['name', 'city', 'category', 'perks'],
  accommodations: ['name', 'city', 'category', 'perks'],
};
