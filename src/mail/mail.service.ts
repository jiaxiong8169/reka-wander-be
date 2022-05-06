import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { CarRentalMailDataDto } from 'src/dto/car-rental-mail-data.dto';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public sendForgotPasswordMail(name, email): void {
    this.mailerService
      .sendMail({
        to: email, // list of receivers
        subject: 'You requested to reset your password.', // Subject line
        template: 'general_email_template_without_button',
        context: {
          title: 'Reset your password',
          name,
          message: 'You can reset your password now.',
          messageDetails: 'The link is only valid for certain period of time.',
        },
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public sendCarRentalRequestMail(
    data: CarRentalMailDataDto,
    vendorEmail: string,
    user: User,
  ) {
    console.log('send mail');
    const { name, email, phoneNumber } = user;
    this.mailerService
      .sendMail({
        to: vendorEmail,
        subject: 'New car rental request from Reka Wander',
        template: 'car_rental.hbs',
        context: {
          data,
          user: {
            name: name || 'Not Provided',
            email,
            phoneNumber,
          },
        },
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}
