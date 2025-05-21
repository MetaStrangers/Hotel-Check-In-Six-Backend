import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import { AppLogger } from '../customs';

@Injectable()
export class CloudinaryService {
  private readonly logger = new AppLogger(this.constructor.name);
  private readonly folderName = process.env.CLOUDINARY_FOLDER_NAME;
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(file?.path, {
        folder: this.folderName,
      });
      const imageUrl = result?.secure_url;
      fs.unlinkSync(file.path); // Remove local file after upload
      return imageUrl;
    } catch (e) {
      this.logger.error(`Error uploading to Cloudinary: ${e?.message}`);
    }
  }
}
