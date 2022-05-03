load('./utils.js');

const data = requireUncached('./data/attractions.json');
fixLocationStructure(data);

// add attractions
db.attractions.insertMany(data);

createReviews('attractions');
