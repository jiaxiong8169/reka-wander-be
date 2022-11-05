import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { ReviewsModule } from './reviews/reviews.module';
import { ReservationsModule } from './reservation/reservation.module';
import { TripsModule } from './trips/trips.module';
import { InterestsModule } from './interests/interests.module';
import { AttractionsModule } from './attractions/attractions.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { HotelsModule } from './hotels/hotels.module';
import { HomestaysModule } from './homestays/homestays.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { GuidesModule } from './guides/guides.module';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';
import { CarRentalModule } from './car-rental/car-rental.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ReviewsModule,
    ReservationsModule,
    TripsModule,
    InterestsModule,
    AttractionsModule,
    RestaurantsModule,
    HotelsModule,
    HomestaysModule,
    VehiclesModule,
    GuidesModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_DB_CONNECTION_URI),
    MailModule,
    CarRentalModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      serveRoot: '/auth/resetpassword',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
