export enum ExceptionMessage {
  Authentication = 'Email or password not found.',
  RefreshTokenRevoked = 'Your refresh token is revoked.',
  RefreshTokenTempered = 'Your refresh token is invalid.',
  AccessTokenExpired = 'Your access token is expired.',
  UserExist = 'User with the same email exists in the database. Please try another email.',
  PasswordNotProvided = 'Password should be provided to register new user.',
  EmailNotProvided = 'Email should be provided to register new user.',
  WeakPassword = 'The password is too weak. Your password should contain at least 1 upper case letter, 1 lower case letter and 1 number or special character',
  DeleteOwnAccount = 'You should not be deleting your own account!',
  InvalidImageData = 'Image data received is invalid.',
  AccountNotExist = 'Your account does not exist. Please try again.',
  UserNotFound = 'User not found. Please try again.',
  CannotDelete = 'Unable to delete this entry. Please try again.',
  ReviewNotFound = 'Review not found. Please try again.',
  ReviewExist = 'Review already exists.',
  HotelNotFound = 'Hotel not found. Please try again.',
  HotelExist = 'Hotel already exists.',
  AttractionNotFound = 'Attraction not found. Please try again.',
  AttractionExist = 'Attraction already exists.',
  InterestNotFound = 'Interest not found. Please try again.',
  InterestExist = 'Interest already exists.',
  TripNotFound = 'Trip not found. Please try again.',
  TripExist = 'Trip already exists.',
  RestaurantNotFound = 'Restaurant not found. Please try again.',
  RestaurantExist = 'Restaurant already exists.',
  HomestayNotFound = 'Homestay not found. Please try again.',
  HomestayExist = 'Homestay already exists.',
  VehicleNotFound = 'Vehicle not found. Please try again.',
  VehicleExist = 'Vehicle already exists.',
  GuideNotFound = 'Guide not found. Please try again.',
  GuideExist = 'Guide already exists.',
  ResetTokenUsed = 'The link is being used before. Please request a new one again.',
  PasswordMismatch = 'The password entered do not match your original password.',
}
