function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}

function fixLocationStructure(data) {
  data.forEach((d) => {
    d.loc = {
      type: 'Point',
      coordinates: [d['loc - long'], d['loc - lat']],
    };
    delete d['loc - lat'];
    delete d['loc - long'];
  });
}

function createReviews(collectionName) {
  // get all dummy users
  const users = db.users.find({
    email: {
      $nin: [
        // whitelist actual emails
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
  const usersClone = [];
  users.forEach((u) => usersClone.push(u));

  // get all collectionName
  const data = db[collectionName].find({});

  // add reviews for the dummy users
  const ratingChoices = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  const commentChoices = [
    'Good service',
    'Excellent!',
    'I will definitely come back again.',
    'Amazing experience!',
    "I think it's refreshing but can be improve further",
  ];
  // Add user reviews, likes and shares
  data.forEach((d) => {
    usersClone.forEach((u) => {
      const seed = Math.random();
      if (seed >= 0.5) {
        d.shares.push(u._id);
        d.likes.push(u._id);
      }
      // insert a new review
      const rating = ratingChoices[Math.floor(seed * ratingChoices.length)];
      // insert review
      const review = db.reviews.insertOne({
        targetId: d._id,
        userId: u._id,
        userName: u.name,
        userProfileSrc: '',
        timestamp: new Date(),
        contents: commentChoices[Math.floor(seed * commentChoices.length)],
        rating: rating,
      });
      // insert review
      d.reviews.push(review.insertedId);
      d.rateValue += rating;
      d.rateCount++;
    });
    d.avgRating = d.rateValue / d.rateCount;
    // update
    db[collectionName].updateOne(
      { _id: d._id },
      {
        $set: {
          rateCount: d.rateCount,
          rateValue: d.rateValue,
          avgRating: d.avgRating,
          reviews: d.reviews,
          shares: d.shares,
          likes: d.likes,
        },
      },
    );
  });
}
