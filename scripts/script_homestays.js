function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}

const data = requireUncached('./data/homestays.json');
const rooms = requireUncached('./data/rooms.json');

db.trips.remove({});
db.homestays.remove({});

data.forEach((d) => {
  // get rooms
  d.rooms = rooms.filter((r) => r.name === d.name);
});

const result = db.homestays.insertMany(data);
print(result);
