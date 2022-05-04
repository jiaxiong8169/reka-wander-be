load('./utils.js');

const data = requireUncached('./data/guides.json');
const packages = requireUncached('./data/packages.json');
fixLocationStructure(data);

data.forEach((d) => {
  // get packages
  d.packages = packages.filter((r) => r.guideName === d.name);
  // append object ID
  d.packages.forEach((p) => {
    p._id = new ObjectId();
  });
});

const result = db.guides.insertMany(data);

print(result);

createReviews('guides');
