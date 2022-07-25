load('./utils.js');

const data = requireUncached('./data/users.json');

const rslt = db.users.find({
  email: {
    $in: [
      // whitelist emails to not delete
      'xingyee0908@gmail.com',
      'nicole@rekawander.com',
      'chinxiongwei@hotmail.com',
      'fhueiching@gmail.com',
      'autumnlewjb@gmail.com',
      'haziqyazet@gmail.com',
      'haziq@lcpbuildsofttechnology.com',
    ],
  },
});

rslt.forEach((r) => {
  db.users.updateOne(
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
      'haziqyazet@gmail.com',
      'haziq@lcpbuildsofttechnology.com',
    ],
  },
});

const result = db.users.insertMany(data);
print(result);
