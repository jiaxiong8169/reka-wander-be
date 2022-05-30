import { Body, Controller, Post } from '@nestjs/common';
import { CarRentalMailDataDto } from 'src/dto/car-rental-mail-data.dto';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Post('car-request')
  async notifyVendorWithMail(
    @Body() body: CarRentalMailDataDto,
  ): Promise<void> {
    this.mailService.sendCarRentalRequestMail(body);
  }
}
