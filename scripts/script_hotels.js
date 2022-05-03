function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}

const data = requireUncached('./data/hotels.json');
const rooms = requireUncached('./data/rooms.json');

db.trips.remove({});
db.hotels.remove({});

data.forEach((d) => {
  // get rooms
  d.rooms = rooms.filter((r) => r.name === d.name);
});

const result = db.hotels.insertMany(data);
print(result);
