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
    // comments
    Permission.CreateComment,
    Permission.UpdateComment,
    Permission.ReadAllComments,
    Permission.DeleteComment,
    Permission.ReadComment,
    // accommodation
    Permission.CreateAccommodation,
    Permission.UpdateAccommodation,
    Permission.ReadAllAccommodations,
    Permission.DeleteAccommodation,
    Permission.ReadAccommodation,
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
    // rate
    Permission.CreateRate,
    Permission.UpdateRate,
    Permission.ReadAllRates,
    Permission.DeleteRate,
    Permission.ReadRate,
    // trip
    Permission.CreateTrip,
    Permission.UpdateTrip,
    Permission.ReadAllTrips,
    Permission.DeleteTrip,
    Permission.ReadTrip,
    // victual
    Permission.CreateVictual,
    Permission.UpdateVictual,
    Permission.ReadAllVictuals,
    Permission.DeleteVictual,
    Permission.ReadVictual,
  ],
  user: [
    Permission.ReadProfile,
    // comments
    Permission.CreateComment,
    Permission.ReadAllComments,
    Permission.ReadComment,
    // accommodation
    Permission.ReadAllAccommodations,
    Permission.ReadAccommodation,
    // attraction
    Permission.ReadAllAttractions,
    Permission.ReadAttraction,
    // interest
    Permission.ReadAllInterests,
    Permission.ReadInterest,
    // rate
    Permission.CreateRate,
    Permission.UpdateRate,
    Permission.ReadAllRates,
    Permission.ReadRate,
    // trip
    Permission.CreateTrip,
    Permission.ReadAllTrips,
    Permission.DeleteTrip,
    Permission.ReadTrip,
    // victual
    Permission.ReadAllVictuals,
    Permission.ReadVictual,
  ],
};
