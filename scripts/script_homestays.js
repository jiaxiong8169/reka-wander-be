load('./utils.js');

const data = requireUncached('./data/homestays.json');
const rooms = requireUncached('./data/rooms.json');
fixLocationStructure(data);

data.forEach((d) => {
  // change string into list
  d.additionalRules = JSON.parse(d.additionalRules.replace(/\\/g, ''));
  d.amenities = JSON.parse(d.amenities.replace(/\\/g, ''));
  // get rooms
  d.rooms = rooms.filter((r) => r.name === d.name);
  // append object ID
  d.rooms.forEach((p) => {
    p._id = new ObjectId();
    // p.amenities = JSON.parse(p.amenities.replace(/\\/g, ''));
    p.bedTypes = JSON.parse(p.bedTypes.replace(/\\/g, ''));
  });
});

const result = db.homestays.insertMany(data);
print(result);
