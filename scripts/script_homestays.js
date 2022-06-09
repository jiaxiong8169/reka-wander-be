load('./utils.js');

const data = requireUncached('./data/homestays.json');
const rooms = requireUncached('./data/rooms.json');
fixLocationStructure(data);

data.forEach((d) => {
  // get rooms
  d.rooms = rooms.filter((r) => r.name === d.name);
  // append object ID
  d.rooms.forEach((p) => {
    p._id = new ObjectId();
  });
});

const result = db.homestays.insertMany(data);
print(result);
