import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-firebase-jwt';
import { AuthService } from '../auth.service';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

@Injectable()
export class FirebaseAuthStrategy extends PassportStrategy(
  Strategy,
  'firebase-strategy',
) {
  private defaultApp: any;
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
    });
    const firebase_private_key_b64 = Buffer.from(
      process.env.FIREBASE_PRIVATE_KEY,
      'base64',
    );
    const firebase_private_key = firebase_private_key_b64
      .toString('utf8')
      .replace(/\\n/g, '\n');
    const serviceAccount = {
      type: 'service_account',
      project_id: 'reka-wander',
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: firebase_private_key,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    } as ServiceAccount;

    this.defaultApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  async validate(request, token) {
    const { email } = request.body;
    return await this.defaultApp
      .auth()
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
