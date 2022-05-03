load('./utils.js');

const data = requireUncached('./data/homestays.json');
const rooms = requireUncached('./data/rooms.json');
fixLocationStructure(data);

data.forEach((d) => {
  // get rooms
  d.rooms = rooms.filter((r) => r.name === d.name);
});

const result = db.homestays.insertMany(data);
print(result);
