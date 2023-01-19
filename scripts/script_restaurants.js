load('./utils.js');

const data = requireUncached('./data/restaurants.json');
fixLocationStructure(data);

const result = db.restaurants.insertMany(data);
print(result);

createReviews('restaurants');
