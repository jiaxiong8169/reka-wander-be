import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { CarRentalMailDataDto } from 'src/dto/car-rental-mail-data.dto';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public sendForgotPasswordMail(
    email: string,
    resetPasswordLink: string,
    validityInMinutes: number,
  ): void {
    this.mailerService
      .sendMail({
        to: email, // list of receivers
        subject: 'You requested to reset your password.', // Subject line
        template: 'general_email_template_with_button',
        context: {
          title: 'Reset your password',
          name: email,
          message: 'You can reset your password now.',
          messageDetails: `The link is only valid for ${validityInMinutes} minute${
            validityInMinutes > 1 ? 's' : ''
          }.`,
          link: resetPasswordLink,
          linkText: 'Reset Password',
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
    const { email, phoneNumber } = user;
    this.mailerService
      .sendMail({
        to: vendorEmail,
        subject: 'New car rental request from Reka Wander',
        template: 'car_rental.hbs',
        context: {
          data,
          user: {
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
