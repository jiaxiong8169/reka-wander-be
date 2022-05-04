import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { userInfo } from 'os';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { User } from 'src/decorators/user.decorator';
import { CarRentalMailDataDto } from 'src/dto/car-rental-mail-data.dto';
import { JwtPayload } from 'src/dto/payloads.dto';
import { CarRentalService } from './car-rental.service';

@Controller('car-rental')
export class CarRentalController {
  constructor(private carRentalService: CarRentalService) {}

  @Post('mail')
  @UseGuards(JwtAuthGuard)
  async notifyVendorWithMail(
    @User() user: JwtPayload,
    @Body('data') data: CarRentalMailDataDto,
    @Body('vendorEmail') vendorEmail: string,
  ): Promise<void> {
    this.carRentalService.sendVendorMail(data, vendorEmail, user);
  }
}
