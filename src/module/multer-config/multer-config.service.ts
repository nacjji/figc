import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { extname } from 'path';
import * as sharp from 'sharp';
export interface FileUploadedData extends Express.Multer.File {
  originalname: string;
  fileTransedName: string;
  extension: string;
  width: number;
  height: number;
}

@Injectable()
export class MulterConfigService {
  constructor() {}

  private MAX_LENGTH = 1024;
  private MAX_SIZE = 1000000;

  async multerUploader(
    files: Express.Multer.File[],
    prefix: string,
    isResize: boolean = true,
  ) {
    const imageForm = /(.*?)\.(jpg|jpeg|png|gif|bmp)$/;

    AWS.config.update({
      region: process.env.S3_BUCKET_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });

    try {
      const result = [];
      const awsConfig = new AWS.S3();
      for (const file of files) {
        file.originalname = Buffer.from(file.originalname, 'ascii').toString(
          'utf8',
        );
        const ext = extname(file.originalname).slice(1);

        const fileName = `${Date.now()}_${Math.floor(
          Math.random() * 99999,
        )}.${ext}`;

        // 원본 저장
        if (isResize) {
          await awsConfig
            .putObject({
              Key: `origin/${fileName}`,
              Body: file.buffer,
              Bucket: process.env.S3_BUCKET,
              ContentType: file.mimetype,
            })
            .promise();
        }

        // 이미지가 아닌 파일의 경우
        if (!file.originalname.match(imageForm)) {
          await awsConfig
            .putObject({
              Key: `${prefix}/${fileName}`,
              Body: file.buffer,
              Bucket: process.env.S3_BUCKET,
              ContentType: file.mimetype,
            })
            .promise();

          result.push({
            ...file,
            fileTransedName: fileName,
            extension: ext,
            width: null,
            height: null,
          });
          continue;
        }

        let width = null;
        let height = null;
        let size = null;

        await sharp(file.buffer)
          .metadata()
          .then((metadata) => {
            width = metadata.width;
            height = metadata.height;
            size = metadata.size;
          });

        result.push({
          ...file,
          fileTransedName: fileName,
          extension: ext,
          width,
          height,
        });

        if (isResize && size > this.MAX_SIZE) {
          // 가로세로 길이가 MAX_LENGTH를 넘어가지 않으면 리사이징 불필요
          // 이미지 사이즈가 1MB를 넘어가면 리사이징
          // if (width > this.MAX_LENGTH && height > this.MAX_LENGTH) {
          const resizeOption =
            width >= height && size
              ? { width: this.MAX_LENGTH }
              : { height: this.MAX_LENGTH };

          const resizeImage = await sharp(file.buffer)
            .rotate()
            .resize({ ...resizeOption })
            .webp({
              lossless: true,
              quality: 100,
              alphaQuality: 100,
              force: true,
            })
            .toBuffer();
          await awsConfig
            .putObject({
              Key: `${prefix}/${fileName}`,
              Body: resizeImage,
              Bucket: process.env.S3_BUCKET,
              ContentType: file.mimetype,
            })
            .promise();
        } else {
          await awsConfig
            .putObject({
              Key: `${prefix}/${fileName}`,
              Body: file.buffer,
              Bucket: process.env.S3_BUCKET,
              ContentType: file.mimetype,
            })
            .promise();
        }
      }

      return result;
    } catch (error) {
      if (error instanceof BadRequestException)
        throw new BadRequestException(error);
      throw new InternalServerErrorException();
    }
  }
}
