import { SetMetadata } from '@nestjs/common';

export const PUBLIC_KEY = 'isPublic';

export const isPublic = () => SetMetadata(PUBLIC_KEY, true);
