// main script for cleaning all data
db.reviews.deleteMany({});
db.reservations.deleteMany({});
db.trips.deleteMany({});
db.attractions.deleteMany({});
db.guides.deleteMany({});
db.homestays.deleteMany({});
db.hotels.deleteMany({});
db.interests.deleteMany({});
db.restaurants.deleteMany({});
db.vehicles.deleteMany({});

load('script_users.js');
load('script_attractions.js');
load('script_guides.js');
load('script_homestays.js');
load('script_hotels.js');
load('script_interests.js');
load('script_restaurants.js');
load('script_vehicles.js');
load('script_reservations.js');
