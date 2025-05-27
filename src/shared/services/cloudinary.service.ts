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
      if (file.buffer) {
        return await new Promise<string>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: this.folderName },
            (error, result) => {
              if (error) {
                this.logger.error(`Error uploading to Cloudinary: ${error.message}`);
                return reject(error);
              }
              return resolve(result.secure_url);
            },
          );
          uploadStream.end(file.buffer);
        });
      }

      // Fallback: if using diskStorage
      const result = await cloudinary.uploader.upload(file.path, {
        folder: this.folderName,
      });

      fs.unlinkSync(file.path); // clean up
      return result.secure_url;
    } catch (e) {
      this.logger.error(`Error uploading to Cloudinary: ${e?.message}`);
      throw e;
    }
  }
}
