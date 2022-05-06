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

  public sendResetPasswordConfirmationEmail(email: string) {
    this.mailerService.sendMail({
      to: email,
      subject: 'You changed your password.',
      template: 'general_email_template_with_button',
      context: {
        title: 'Someone changed your password.',
        name: email,
        message:
          'We hope you are the one that changed the password. If not, click the button below to report this security issue.',
        messageDetails: `Send an email to our support team to further assist you, manually or by clicking the button below.`,
        link: 'mailto:rekawander@gmail.com?subject=Unexpected password change&body=I did not change the password for my account. Please look into the issue.',
        linkText: 'Reset Password',
      },
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
