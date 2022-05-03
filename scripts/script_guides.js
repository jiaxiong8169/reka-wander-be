function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}

const data = requireUncached('./data/guides.json');
const packages = requireUncached('./data/packages.json');

db.guides.remove({});

data.forEach((d) => {
  // get packages
  d.packages = packages.filter((r) => r.name === d.name);
});

const result = db.guides.insertMany(data);
print(result);
