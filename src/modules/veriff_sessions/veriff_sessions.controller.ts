import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AppLogger } from 'src/shared/customs';
import { VeriffSessionsService } from './veriff_sessions.service';
import { CloudinaryService } from 'src/shared/services';
import { VeriffSessionDataService } from 'src/shared/services/entities';
import { PartnerCompany } from 'src/shared/decorators';
import { PartnerCompanyDto } from 'src/shared/interfaces/decorators';
import { FindOneVeriffSessionDto, PutVeriffSessionBodyDto } from './dto/index.dto';
import { VeriffSessionStatus } from 'src/shared/enum';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { VeriffSessionDocument } from 'src/shared/interfaces';

@Controller('veriff_sessions')
export class VeriffSessionsController {
  private readonly logger = new AppLogger(this.constructor.name);
  private readonly WEB_PANEL_BASE_URL = process.env.WEB_PANEL_BASE_URL;

  constructor(
    private readonly veriffSessionService: VeriffSessionsService,
    private readonly veriffSessionDataService: VeriffSessionDataService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createASession(@PartnerCompany() partnerCompany: PartnerCompanyDto) {
    const veriffSession = await this.veriffSessionService.save({
      company: { id: partnerCompany?.id },
    });

    const url = `${this.WEB_PANEL_BASE_URL}?sessionId=${veriffSession?.id}`;

    return {
      result: {
        session_url: url,
      },
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findOneSession(@Query() q: FindOneVeriffSessionDto) {
    const veriffSession = await this.veriffSessionService.findOne({
      where: {
        id: q?.id,
      },
      relations: { session_data: true, company: true },
    });

    if (!veriffSession) {
      throw new HttpException(`Session Not Found!`, HttpStatus.BAD_REQUEST);
    }

    if (veriffSession?.status === VeriffSessionStatus.CREATED) {
      veriffSession.status = VeriffSessionStatus.STARTED;
      await this.veriffSessionService.save(veriffSession);
    }

    delete veriffSession?.company?.api_key;
    delete veriffSession?.company?.api_secret;
    delete veriffSession?.company?.created_at;
    delete veriffSession?.company?.updated_at;
    delete veriffSession?.company?.deleted_at;
    delete veriffSession?.deleted_at;
    delete veriffSession?.session_data?.deleted_at;

    return {
      result: veriffSession,
    };
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'document_front_side_image', maxCount: 1 },
        { name: 'document_back_side_image', maxCount: 1 },
      ],
      {
        fileFilter: (req, file, callback) => {
          if (!file?.originalname?.match(/\.(jpg|jpeg|png)$/)) {
            return callback(
              new BadRequestException('Only image files are allowed (jpg, jpeg, png)'),
              false,
            );
          }
          callback(null, true);
        },
        limits: {
          fileSize: 1024 * 1024 * 3, // 3MB
        },
      },
    ),
  )
  async updateSession(
    @Body() bd: PutVeriffSessionBodyDto,
    @UploadedFiles()
    files: {
      document_front_side_image?: Express.Multer.File[];
      document_back_side_image?: Express.Multer.File[];
    },
  ) {
    const document_front_side_image = files?.document_front_side_image?.[0];
    const document_back_side_image = files?.document_back_side_image?.[0];

    const veriffSession = await this.veriffSessionService.findOne({
      where: {
        id: bd?.id,
      },
      relations: { session_data: true, company: true },
    });

    if (!veriffSession) {
      throw new HttpException(`Session Not Found!`, HttpStatus.BAD_REQUEST);
    }

    if (
      [
        VeriffSessionStatus.APPROVED,
        VeriffSessionStatus.DECLINED,
        VeriffSessionStatus.SUBMITTED,
      ]?.includes(veriffSession?.status)
    ) {
      throw new HttpException(
        `Kindly wait , Your document verification is in-progress or decision already taken!`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!document_front_side_image) {
      throw new BadRequestException('document_front_side_image is required');
    }

    const documentFrontSideImagePayload: VeriffSessionDocument = {} as any;
    const documentBackSideImagePayload: VeriffSessionDocument = {} as any;

    if (document_front_side_image) {
      documentFrontSideImagePayload.media_name = `${Date.now()}-${document_front_side_image?.filename}`;
      documentFrontSideImagePayload.type = `front-side`;
      documentFrontSideImagePayload.media_type = 'image';
      documentFrontSideImagePayload.media_url =
        await this.cloudinaryService.uploadImage(document_front_side_image);
    }

    if (document_back_side_image) {
      documentBackSideImagePayload.media_name = `${Date.now()}-${document_back_side_image?.filename}`;
      documentBackSideImagePayload.type = `front-side`;
      documentBackSideImagePayload.media_type = 'image';
      documentBackSideImagePayload.media_url =
        await this.cloudinaryService.uploadImage(document_back_side_image);
    }

    const veriff_session_data = await this.veriffSessionDataService.save({
      ...(veriffSession?.session_data && veriffSession?.session_data),
      documents: [
        ...(Object.keys(documentFrontSideImagePayload)?.length
          ? [documentFrontSideImagePayload]
          : []),
        ...(Object.keys(documentBackSideImagePayload)?.length
          ? [documentBackSideImagePayload]
          : []),
      ],
      extracted_data: bd?.extracted_data,
      document_id_type: bd?.document_id_type,
    });

    veriffSession.session_data = veriff_session_data;
    veriffSession.status = VeriffSessionStatus.APPROVED;

    await this.veriffSessionService.save(veriffSession);

    delete veriffSession?.company?.api_key;
    delete veriffSession?.company?.api_secret;
    delete veriffSession?.company?.created_at;
    delete veriffSession?.company?.updated_at;
    delete veriffSession?.company?.deleted_at;
    delete veriffSession?.deleted_at;
    delete veriffSession?.session_data?.deleted_at;

    return {
      result: veriffSession,
    };
  }
}
