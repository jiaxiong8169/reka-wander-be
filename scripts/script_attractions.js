function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}

const data = requireUncached('./data/attractions.json');

db.attractions.remove({});
db.trips.remove({});

const result = db.attractions.insertMany(data);
print(result);
