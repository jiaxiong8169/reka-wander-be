import { Permission } from './permission.enum';

export const Roles = {
  admin: [
    Permission.ReadProfile,
    // users
    Permission.CreateUser,
    Permission.UpdateUser,
    Permission.ReadAllUsers,
    Permission.DeleteUser,
    Permission.ReadUser,
    // reviews
    Permission.CreateReview,
    Permission.UpdateReview,
    Permission.ReadAllReviews,
    Permission.DeleteReview,
    Permission.ReadReview,
    // hotel
    Permission.CreateHotel,
    Permission.UpdateHotel,
    Permission.ReadAllHotels,
    Permission.DeleteHotel,
    Permission.ReadHotel,
    // attraction
    Permission.CreateAttraction,
    Permission.UpdateAttraction,
    Permission.ReadAllAttractions,
    Permission.DeleteAttraction,
    Permission.ReadAttraction,
    // interest
    Permission.CreateInterest,
    Permission.UpdateInterest,
    Permission.ReadAllInterests,
    Permission.DeleteInterest,
    Permission.ReadInterest,
    // trip
    Permission.CreateTrip,
    Permission.UpdateTrip,
    Permission.ReadAllTrips,
    Permission.DeleteTrip,
    Permission.ReadTrip,
    // restaurant
    Permission.CreateRestaurant,
    Permission.UpdateRestaurant,
    Permission.ReadAllRestaurants,
    Permission.DeleteRestaurant,
    Permission.ReadRestaurant,
  ],
  user: [
    Permission.ReadProfile,
    // reviews
    Permission.CreateReview,
    Permission.ReadAllReviews,
    Permission.ReadReview,
    // hotel
    Permission.ReadAllHotels,
    Permission.ReadHotel,
    // attraction
    Permission.ReadAllAttractions,
    Permission.ReadAttraction,
    // interest
    Permission.ReadAllInterests,
    Permission.ReadInterest,
    // trip
    Permission.CreateTrip,
    Permission.ReadAllTrips,
    Permission.DeleteTrip,
    Permission.ReadTrip,
    // restaurant
    Permission.ReadAllRestaurants,
    Permission.ReadRestaurant,
  ],
};
