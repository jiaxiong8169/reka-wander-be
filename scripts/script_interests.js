load('./utils.js');

const data = requireUncached('./data/interests.json');

const result = db.interests.insertMany(data);
print(result);
