import { Injectable } from '@nestjs/common';
import { Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { CommentDto } from 'src/dto/comment.dto';
import { ExceptionMessage } from 'src/exceptions/exception-message.enum';
import { Comment, CommentDocument } from 'src/schemas/comment.schema';
import { SearchQueryDto } from 'src/dto/search-params.dto';
import { processSearchAndFilter } from 'src/utils';
import { SEARCH_FIELDS } from 'src/constants';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private commentModel: mongoose.Model<CommentDocument>,
  ) {}

  async findOneCommentById(
    commentId: mongoose.Types.ObjectId | string,
  ): Promise<Comment> {
    return this.commentModel
      .findOne({
        _id: commentId,
      })
      .orFail(new Error(ExceptionMessage.CommentNotFound));
  }

  async updateCommentById(
    commentId: mongoose.Types.ObjectId,
    req: CommentDto,
  ): Promise<Comment> {
    return this.commentModel.findOneAndUpdate({ _id: commentId }, req, {
      new: true,
      runValidators: true,
    });
  }

  async create(@Body() commentDto: CommentDto): Promise<Comment> {
    const createdComment = new this.commentModel(commentDto);
    return createdComment.save().catch(() => {
      throw Error(ExceptionMessage.CommentExist);
    });
  }

  async deleteOneCommentByCommentId(
    commentId: mongoose.Types.ObjectId,
  ): Promise<Comment> {
    return this.commentModel
      .findOneAndDelete({ _id: commentId })
      .orFail(new Error(ExceptionMessage.CannotDelete));
  }

  async findAllComments(params: SearchQueryDto): Promise<Comment[]> {
    // fallback to empty filter if filter is not provided
    // find with empty filter will return all documents
    const { sort, offset, limit, filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['comments'],
    );
    let query = this.commentModel.find(effectiveFilter);
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

  async getCommentsResultCount(params: SearchQueryDto): Promise<number> {
    const { filter = {} } = params;
    const effectiveFilter = processSearchAndFilter(
      filter,
      SEARCH_FIELDS['comments'],
    );
    return this.commentModel.find(effectiveFilter).countDocuments();
  }
}
