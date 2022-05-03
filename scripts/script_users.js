function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}

const data = requireUncached('./data/users.json');

const rslt = db.users.find({
  email: {
    $in: [
      // whitelist emails to not delete
      'xingyee0908@gmail.com',
      'nicole@rekawander.com',
      'chinxiongwei@hotmail.com',
      'fhueiching@gmail.com',
    ],
  },
});

rslt.forEach((r) => {
  db.users.update(
    { email: r.email },
    {
      $set: {
        trips: [],
        markedGuides: [],
      },
    },
  );
});

db.users.remove({
  email: {
    $nin: [
      // whitelist emails to not delete
      'xingyee0908@gmail.com',
      'nicole@rekawander.com',
      'chinxiongwei@hotmail.com',
      'fhueiching@gmail.com',
    ],
  },
});

const result = db.users.insertMany(data);
print(result);