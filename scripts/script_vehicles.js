load('./utils.js');

const data = requireUncached('./data/vehicles.json');
fixLocationStructure(data);

const result = db.vehicles.insertMany(data);
print(result);
