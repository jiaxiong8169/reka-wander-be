import { Module } from '@nestjs/common';
import { CarRentalService } from './car-rental.service';
import { CarRentalController } from './car-rental.controller';
import { MailModule } from 'src/mail/mail.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [MailModule, UsersModule],
  providers: [CarRentalService],
  controllers: [CarRentalController],
})
export class CarRentalModule {}
