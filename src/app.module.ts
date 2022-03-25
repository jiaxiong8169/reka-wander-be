import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { CommentsModule } from './comments/comments.module';
import { TripsModule } from './trips/trips.module';
import { RatesModule } from './rates/rates.module';
import { InterestsModule } from './interests/interests.module';
import { AttractionsModule } from './attractions/attractions.module';
import { VictualsModule } from './victuals/victuals.module';
import { AccommodationsModule } from './accommodations/accommodations.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CommentsModule,
    TripsModule,
    RatesModule,
    InterestsModule,
    AttractionsModule,
    VictualsModule,
    AccommodationsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_DB_CONNECTION_URI),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}