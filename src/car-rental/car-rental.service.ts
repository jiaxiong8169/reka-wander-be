import { Injectable } from '@nestjs/common';
import { Exception } from 'handlebars';
import { CarRentalMailDataDto } from 'src/dto/car-rental-mail-data.dto';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { JwtPayload } from 'src/dto/payloads.dto';
import { ExceptionMessage } from 'src/exceptions/exception-message.enum';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/schemas/user.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CarRentalService {
  constructor(
    private mailService: MailService,
    private usersService: UsersService,
  ) {}

  async sendVendorMail(
    data: CarRentalMailDataDto,
    vendorEmail: string,
    user: JwtPayload,
  ): Promise<void> {
    const findUser: User = await this.usersService.findOneUserByEmail(
      user.email,
    );
    if (!findUser) throw new Exception(ExceptionMessage.UserNotFound);
    this.mailService.sendCarRentalRequestMail(data, vendorEmail, findUser);
  }
}
