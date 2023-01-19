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
      'haziqnyalas@gmail.com',
      'testingspace93@gmail.com',
      'haikal@lcpbuildsofttechnology.com',
      'testingspace9392@gmail.com',
      'michelle.wgt@gmail.com',
      'nicky.lyy2000@gmail.com',
      'xingyee0908@rekawander.com',
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
      'autumnlewjb@gmail.com',
      'haziqyazet@gmail.com',
      'haziqnyalas@gmail.com',
      'testingspace93@gmail.com',
      'haikal@lcpbuildsofttechnology.com',
      'testingspace9392@gmail.com',
      'michelle.wgt@gmail.com',
      'nicky.lyy2000@gmail.com',
      'xingyee0908@rekawander.com',
    ],
  },
});

const result = db.users.insertMany(data);
print(result);
