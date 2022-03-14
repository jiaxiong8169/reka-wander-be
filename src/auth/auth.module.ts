import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local-auth/local.strategy';
import { JwtStrategy } from './jwt-auth/jwt.strategy';
import JwtRefreshGuard from './jwt-refresh/jwt-refresh.guard';
import { JwtResetPasswordGuard } from './jwt-reset-password/jwt-reset-password.guard';
import { JwtRefreshStrategy } from './jwt-refresh/jwt-refresh.strategy';
import { JwtResetPasswordStrategy } from './jwt-reset-password/jwt-reset-password.strategy';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({}),
    PassportModule.register({ defaultStrategy: 'local' }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtResetPasswordStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
