import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local-auth/local.strategy';
import { JwtStrategy } from './jwt-auth/jwt.strategy';
import { JwtRefreshStrategy } from './jwt-refresh/jwt-refresh.strategy';
import { JwtResetPasswordStrategy } from './jwt-reset-password/jwt-reset-password.strategy';
import { FirebaseAuthStrategy } from './firebase-auth/firebase-auth.strategy';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({}),
    PassportModule.register({ defaultStrategy: 'local' }),
    MailModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtResetPasswordStrategy,
    FirebaseAuthStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
