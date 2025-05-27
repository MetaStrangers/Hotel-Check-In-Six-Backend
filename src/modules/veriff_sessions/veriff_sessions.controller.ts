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
import { DocumentExtractionService } from 'src/shared/services/document-extraction.service';
import multer from 'multer';

@Controller('veriff_sessions')
export class VeriffSessionsController {
  private readonly logger = new AppLogger(this.constructor.name);
  private readonly WEB_PANEL_BASE_URL = process.env.WEB_PANEL_BASE_URL;

  constructor(
    private readonly veriffSessionService: VeriffSessionsService,
    private readonly veriffSessionDataService: VeriffSessionDataService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly documentExtractionService: DocumentExtractionService,
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
        session_id: veriffSession?.id,
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
        storage: multer.memoryStorage(),
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

    let extracted_data: {
      id_type: string | null;
      id_number: string | null;
      date_of_birth: string | null;
      person_name: string | null;
      address: string | null;
      document_country: string | null;
      issued_date: string | null;
      expiry_date: string | null;
    } = {} as any;

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
      try {
        extracted_data = await this.documentExtractionService.extractDataFromDocument(
          document_front_side_image?.buffer,
          document_front_side_image?.mimetype,
        );

        if (
          !extracted_data?.id_type ||
          !extracted_data?.id_number ||
          !extracted_data?.document_country
        ) {
          throw new Error(`Error: Try Again, Failed to Process Your Documents!`);
        }

        const documentAlreadyExist = await this.veriffSessionDataService.findOne({
          select: ['id'],
          where: {
            id_type: extracted_data?.id_type?.toUpperCase()?.trim(),
            id_number: extracted_data?.id_number?.toUpperCase()?.trim(),
            document_country: extracted_data?.document_country?.toUpperCase()?.trim(),
            session: { company: { id: veriffSession?.company?.id } },
          },
        });

        if (documentAlreadyExist) {
          throw new Error(`Error: Duplicate Verification with same document!`);
        }
      } catch (e) {
        const errMessage = `${e?.message}`?.startsWith(`Error: `)
          ? `${e?.message}`?.split(`Error: `)?.[1]
          : `Try Again, Failed to Process Your Documents!`;

        throw new HttpException(errMessage, HttpStatus.BAD_REQUEST);
      }

      documentFrontSideImagePayload.media_name = `${Date.now()}-${document_front_side_image?.originalname}`;
      documentFrontSideImagePayload.type = `front-side`;
      documentFrontSideImagePayload.media_type = 'image';
      documentFrontSideImagePayload.media_url =
        await this.cloudinaryService.uploadImage(document_front_side_image);
    }

    if (document_back_side_image) {
      documentBackSideImagePayload.media_name = `${Date.now()}-${document_back_side_image?.originalname}`;
      documentBackSideImagePayload.type = `back-side`;
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
      ...extracted_data,
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
