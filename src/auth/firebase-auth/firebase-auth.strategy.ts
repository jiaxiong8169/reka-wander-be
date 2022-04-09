import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-firebase-jwt';
import { auth } from 'firebase-admin';
import { AuthService } from '../auth.service';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

@Injectable()
export class FirebaseAuthStrategy extends PassportStrategy(
  Strategy,
  'firebase-strategy',
) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
    });
    const serviceAccount = {
      type: 'service_account',
      project_id: 'reka-wander',
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    } as ServiceAccount;

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  async validate(request, token) {
    const { email } = request.body;
    return auth()
      .verifyIdToken(token, true)
      .then(async (value) => {
        return await this.authService.validateUserWithoutPassword(
          value.email ?? email, // fallback as sometimes there is no email in the token
        );
      })
      .catch((err) => {
        console.log(err);
        throw new UnauthorizedException();
      });
  }
}
