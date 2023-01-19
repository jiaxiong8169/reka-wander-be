import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import {
  CarRentalMailDataDto,
  GuideMailDataDto,
  HomestayMailDataDto,
  HotelMailDataDto,
} from 'src/dto/mail-data.dto';

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
          supportEmail: process.env.ADMIN_EMAIL,
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
        supportEmail: process.env.ADMIN_EMAIL,
        title: 'Someone changed your password.',
        name: email,
        message:
          'We hope you are the one that changed the password. If not, click the button below to report this security issue.',
        messageDetails: `Send an email to our support team to further assist you, manually or by clicking the button below.`,
        link: `mailto:${process.env.ADMIN_EMAIL}?subject=Unexpected password change&body=I did not change the password for my account. Please look into the issue.`,
        linkText: 'Reset Password',
      },
    });
  }

  public sendCarRentalRequestMail(data: CarRentalMailDataDto) {
    this.mailerService
      .sendMail({
        to: data?.user?.email,
        subject: 'New Car Rental Request from Reka Wander',
        template: 'car_rental.hbs',
        context: {
          supportEmail: process.env.ADMIN_EMAIL,
          data,
        },
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public sendCarRentalVendorMail(data: CarRentalMailDataDto) {
    this.mailerService
      .sendMail({
        to: data?.vehicle?.vendorEmail,
        subject: 'New Car Rental Request from Reka Wander',
        template: 'car_rental_vendor.hbs',
        context: {
          supportEmail: process.env.ADMIN_EMAIL,
          data,
        },
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public sendHomestayMail(data: HomestayMailDataDto) {
    this.mailerService
      .sendMail({
        to: data?.user?.email,
        subject: 'New Homestay Booking Request from Reka Wander',
        template: 'homestay.hbs',
        context: {
          supportEmail: process.env.ADMIN_EMAIL,
          data,
        },
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public sendHomestayVendorMail(data: HomestayMailDataDto) {
    this.mailerService
      .sendMail({
        to: data?.homestay?.vendorEmail,
        subject: 'New Homestay Booking Request from Reka Wander',
        template: 'homestay_vendor.hbs',
        context: {
          supportEmail: process.env.ADMIN_EMAIL,
          data,
        },
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public sendHotelMail(data: HotelMailDataDto) {
    this.mailerService
      .sendMail({
        to: data?.user?.email,
        subject: 'New Hotel Booking Request from Reka Wander',
        template: 'hotel.hbs',
        context: {
          supportEmail: process.env.ADMIN_EMAIL,
          data,
        },
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public sendHotelVendorMail(data: HotelMailDataDto) {
    this.mailerService
      .sendMail({
        to: data?.hotel?.vendorEmail,
        subject: 'New Hotel Booking Request from Reka Wander',
        template: 'hotel_vendor.hbs',
        context: {
          supportEmail: process.env.ADMIN_EMAIL,
          data,
        },
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public sendGuideMail(data: GuideMailDataDto) {
    this.mailerService
      .sendMail({
        to: data?.user?.email,
        subject: 'New Guide Booking Request from Reka Wander',
        template: 'guide.hbs',
        context: {
          supportEmail: process.env.ADMIN_EMAIL,
          data,
        },
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  public sendGuideVendorMail(data: GuideMailDataDto) {
    this.mailerService
      .sendMail({
        to: data?.guide?.vendorEmail,
        subject: 'New Guide Booking Request from Reka Wander',
        template: 'guide_vendor.hbs',
        context: {
          supportEmail: process.env.ADMIN_EMAIL,
          data,
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
