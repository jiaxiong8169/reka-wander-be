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

print('user');
load('script_users.js');
print('attraction');
load('script_attractions.js');
print('guide');
load('script_guides.js');
print('homestay');
load('script_homestays.js');
print('hotel');
load('script_hotels.js');
print('interest');
load('script_interests.js');
print('restaurant');
load('script_restaurants.js');
print('vehicle');
load('script_vehicles.js');
