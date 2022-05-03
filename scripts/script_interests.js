function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}

const data = requireUncached('./data/interests.json');

db.interests.remove({});

const result = db.interests.insertMany(data);
print(result);
