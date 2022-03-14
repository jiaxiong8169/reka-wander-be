const cookieSettings = {
  httpOnly: true,
  // secure can only work in production mode
  // localhost is not running on https cookies will not stick
  secure: process.env.NODE_ENV === 'production',
};

export default cookieSettings;
