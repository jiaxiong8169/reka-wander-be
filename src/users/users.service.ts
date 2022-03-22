import { BadRequestException, Injectable } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { ExceptionMessage } from 'src/exceptions/exception-message.enum';
import { User, UserDocument } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { processSearchAndFilter } from 'src/utils';
import { SEARCH_FIELDS } from 'src/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: mongoose.Model<UserDocument>,
  ) {}

  async findOneUserById(
    userId: mongoose.Types.ObjectId | string,
  ): Promise<User> {
    return this.userModel
      .findOne({
        _id: userId,
      })
      .orFail(new Error(ExceptionMessage.UserNotFound));
  }

  async updateUserById(
    userId: mongoose.Types.ObjectId,
    req: UpdateUserDto,
  ): Promise<User> {
    this.checkEmailAndPasswordStrength(req);
    return this.userModel.findOneAndUpdate({ _id: userId }, req, {
      new: true,
      runValidators: true,
    });
  }

  async create(@Body() userDto: CreateUserDto): Promise<User> {
    const { password } = userDto;
    const saltOrRounds = 10;
    this.checkEmailAndPasswordStrength(userDto, true);
    userDto.password = await bcrypt.hash(password, saltOrRounds);
    const createdUser = new this.userModel(userDto);
    return createdUser.save().catch((e) => {
      //   if (e instanceof mongoose.Error) throw e;
      throw Error(ExceptionMessage.UserExist);
    });
  }

  async setCurrentRefreshToken(
    refreshToken: string,
    email: string,
  ): Promise<User> {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    return this.userModel.findOneAndUpdate(
      { email },
      { currentHashedRefreshToken },
    );
  }

  async deleteOneUserByUserId(
    userId: mongoose.Types.ObjectId,
    authenticatedUserId: string | undefined | null,
  ): Promise<User> {
    // prevent user from deleted their own account when they are authenticated
    if (authenticatedUserId === userId.toString()) {
      throw Error(ExceptionMessage.DeleteOwnAccount);
    }
    return this.userModel
      .findOneAndDelete({ _id: userId })
      .orFail(new Error(ExceptionMessage.CannotDelete));
  }

  async clearCurrentRefreshToken(email: string): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { email },
      { currentHashedRefreshToken: '' },
    );
  }

  async findOneUserByEmail(email: string): Promise<User> {
    return this.userModel
      .findOne({
        email,
      })
      .orFail(new Error(ExceptionMessage.UserNotFound));
  }

  async findAllUsers(params: SearchQueryDto): Promise<User[]> {
    // fallback to empty filter if filter is not provided
    // find with empty fitler will return all documents
    const { sort, offset, limit, filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['users'],
    );
    let query = this.userModel.find(effectiveFilter);
    if (sort) {
      query = query.sort(sort);
    }
    if (offset) {
      query = query.skip(offset);
    }
    if (limit) {
      query.limit(limit);
    }

    return query.exec();
  }

  async getUsersResultCount(params: SearchQueryDto): Promise<number> {
    const { filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['users'],
    );
    return this.userModel.find(effectiveFilter).countDocuments();
  }

  async getUserIfRefreshTokenMatches(
    refreshToken: string,
    email: string,
  ): Promise<User> {
    const user = await this.findOneUserByEmail(email);

    // check if the refresh token is revoked
    if (!user?.currentHashedRefreshToken) {
      throw Error(ExceptionMessage.RefreshTokenRevoked);
    }
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );

    if (!isRefreshTokenMatching) return null;

    return user;
  }

  checkEmailAndPasswordStrength(
    userDto: CreateUserDto | UpdateUserDto,
    strictChecking = false,
  ): void {
    // `strictChecking` - if true, will check if the field exists (not undefined)
    const { email, password } = userDto;
    if ((strictChecking && password === undefined) || password?.length === 0) {
      throw Error(ExceptionMessage.PasswordNotProvided);
    }
    if ((strictChecking && email === undefined) || email?.length === 0) {
      throw Error(ExceptionMessage.EmailNotProvided);
    }
    const regex = /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    if (!!password && !regex.test(password)) {
      throw Error(ExceptionMessage.WeakPassword);
    }
  }

  async changeUserPassword(
    userId: mongoose.Types.ObjectId,
    passwordPlainText: string,
  ): Promise<User> {
    try {
      this.checkEmailAndPasswordStrength(
        { password: passwordPlainText },
        false,
      );
      const hashedPassword = await bcrypt.hash(passwordPlainText, 10);
      return this.updateUserById(userId, { password: hashedPassword });
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
}
