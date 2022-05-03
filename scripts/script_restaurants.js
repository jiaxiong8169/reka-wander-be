function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}

const data = requireUncached('./data/restaurants.json');

db.trips.remove({});
db.restaurants.remove({});

const result = db.restaurants.insertMany(data);
print(result);
