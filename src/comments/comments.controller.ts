import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Permission } from 'src/auth/permission.enum';
import { RequirePermissions } from 'src/auth/permissions.decorator';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { CommentsService } from './comments.service';
import * as mongoose from 'mongoose';
import { CommentDto } from 'src/dto/comment.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get()
  @RequirePermissions(Permission.ReadAllComments)
  async getAllComments(@Query() query: SearchQueryDto) {
    return {
      data: await this.commentsService.findAllComments(query),
      total: await this.commentsService.getCommentsResultCount(query),
    };
  }

  @Get(':commentId')
  @RequirePermissions(Permission.ReadComment)
  async getOneCommentById(
    @Param('commentId') commentId: mongoose.Types.ObjectId,
  ) {
    return this.commentsService.findOneCommentById(commentId).catch((e) => {
      throw new NotFoundException(e.message);
    });
  }

  @Post()
  @RequirePermissions(Permission.CreateComment)
  async createComment(@Body() body: CommentDto) {
    try {
      // assign timestamp to current timestamp
      body.timestamp = new Date();
      const comment = await this.commentsService.create(body);
      return comment;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':commentId')
  @RequirePermissions(Permission.DeleteComment)
  async deleteComment(@Param('commentId') commentId: mongoose.Types.ObjectId) {
    return this.commentsService
      .deleteOneCommentByCommentId(commentId)
      .catch((e: any) => {
        throw new NotFoundException(e.message);
      });
  }

  @Put(':commentId')
  @RequirePermissions(Permission.UpdateComment)
  async updateComment(
    @Body() req: CommentDto,
    @Param('commentId') commentId: mongoose.Types.ObjectId,
  ) {
    try {
      const comment = await this.commentsService.updateCommentById(
        commentId,
        req,
      );
      return comment;
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
}
