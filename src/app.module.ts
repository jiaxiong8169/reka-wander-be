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
import { TripsModule } from './trips/trips.module';
import { InterestsModule } from './interests/interests.module';
import { AttractionsModule } from './attractions/attractions.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { HotelsModule } from './hotels/hotels.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ReviewsModule,
    TripsModule,
    InterestsModule,
    AttractionsModule,
    RestaurantsModule,
    HotelsModule,
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
