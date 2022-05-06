export class JwtPayload {
  sub: string;

  email: string;

  roles: [string];

  permissions: string[];
}

export class JwtPayloadEmailOnly {
  email: string;
}

export class JwtPayloadResetPasswordToken {
  email: string;
  password: string;
}

export class DecodedJwtPayload {
  id: string;

  email: string;

  role: string;

  permissions: string[];
}
