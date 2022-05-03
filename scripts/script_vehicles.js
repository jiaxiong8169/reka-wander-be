function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}

const data = requireUncached('./data/vehicles.json');

db.trips.remove({});
db.vehicles.remove({});

const result = db.vehicles.insertMany(data);
print(result);
