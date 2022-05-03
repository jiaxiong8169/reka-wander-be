load('./utils.js');

const data = requireUncached('./data/hotels.json');
const rooms = requireUncached('./data/rooms.json');
fixLocationStructure(data);

data.forEach((d) => {
  // get rooms
  d.rooms = rooms.filter((r) => r.name === d.name);
});

const result = db.hotels.insertMany(data);
print(result);

createReviews('hotels');
