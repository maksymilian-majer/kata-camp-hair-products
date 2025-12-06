import {
  questionnaireFormSchema,
  type SaveQuestionnaireRequest,
} from '@hair-product-scanner/shared';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { JwtAuthGuard } from '@/api/modules/auth/jwt-auth.guard';
import { ValidationException } from '@/api/shared/exceptions';

import type { ProfileCurator } from './profile-curator.service';
import { PROFILE_CURATOR } from './profile-curator.service';

@Controller('questionnaires')
@UseGuards(JwtAuthGuard)
export class QuestionnairesController {
  constructor(
    @Inject(PROFILE_CURATOR)
    private readonly profileCurator: ProfileCurator
  ) {}

  @Get('me')
  async getMyProfile(@Req() req: Request) {
    const userId = req.user!.id;
    const profile = await this.profileCurator.getProfile(userId);

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return { profile };
  }

  @Post()
  async saveProfile(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: SaveQuestionnaireRequest
  ) {
    const result = questionnaireFormSchema.safeParse(body);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      throw new BadRequestException(firstIssue?.message ?? 'Validation failed');
    }

    const userId = req.user!.id;

    const existingProfile = await this.profileCurator.getProfile(userId);
    const isUpdate = !!existingProfile;

    try {
      const profile = await this.profileCurator.saveProfile(
        userId,
        result.data
      );

      const statusCode = isUpdate ? HttpStatus.OK : HttpStatus.CREATED;
      return res.status(statusCode).json({ profile });
    } catch (error) {
      throw this.mapError(error);
    }
  }

  private mapError(error: unknown): Error {
    if (error instanceof ValidationException) {
      switch (error.code) {
        case 'NOT_FOUND': {
          return new NotFoundException(error.message);
        }
        case 'INVALID_INPUT': {
          return new BadRequestException(error.message);
        }
      }
    }
    Logger.error(error);
    return new InternalServerErrorException('An unexpected error occurred');
  }
}
