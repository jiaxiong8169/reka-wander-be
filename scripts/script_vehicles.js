load('./utils.js');

const data = requireUncached('./data/vehicles.json');
fixLocationStructure(data);

data.forEach((d) => {
  // change string into list
  d.additionalRules = JSON.parse(d.additionalRules.replace(/\\/g, ''));
});

const result = db.vehicles.insertMany(data);
print(result);
