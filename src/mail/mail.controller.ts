import { Body, Controller, Post } from '@nestjs/common';
import {
  CarRentalMailDataDto,
  GuideMailDataDto,
  HomestayMailDataDto,
  HotelMailDataDto,
} from 'src/dto/mail-data.dto';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Post('car-request')
  async notifyCarRentalCustomer(
    @Body() body: CarRentalMailDataDto,
  ): Promise<void> {
    this.mailService.sendCarRentalRequestMail(body);
  }

  @Post('car-vendor')
  async notifyCarRentalVendor(
    @Body() body: CarRentalMailDataDto,
  ): Promise<void> {
    this.mailService.sendCarRentalVendorMail(body);
  }

  @Post('homestay-request')
  async notifyHomestayCustomer(
    @Body() body: HomestayMailDataDto,
  ): Promise<void> {
    this.mailService.sendHomestayMail(body);
  }

  @Post('homestay-vendor')
  async notifyHomestayVendor(@Body() body: HomestayMailDataDto): Promise<void> {
    this.mailService.sendHomestayVendorMail(body);
  }

  @Post('hotel-request')
  async notifyHotelCustomer(@Body() body: HotelMailDataDto): Promise<void> {
    this.mailService.sendHotelMail(body);
  }

  @Post('hotel-vendor')
  async notifyHotelVendor(@Body() body: HotelMailDataDto): Promise<void> {
    this.mailService.sendHotelVendorMail(body);
  }

  @Post('guide-request')
  async notifyGuideCustomer(@Body() body: GuideMailDataDto): Promise<void> {
    this.mailService.sendGuideMail(body);
  }

  @Post('guide-vendor')
  async notifyGuideVendor(@Body() body: GuideMailDataDto): Promise<void> {
    this.mailService.sendGuideVendorMail(body);
  }
}
