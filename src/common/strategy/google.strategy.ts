import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

@Injectable()
// google strategy를 사용하는 passport 기능을 상속
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL:
        process.env.STAGE === 'local'
          ? 'https://figgleapi.fig-zone.com/auth/google/callback' // dev
          : 'https://api.figc.xyz/auth/google/callback', // production
      // callbackURL: `http://localhost:3200/auth/google/callback`,
      // callbackURL: `https://figgleapi.fig-zone.com/auth/google/callback`,
      scope: ['profile', 'email'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile) {
    const { id, emails, provider } = profile;
    return {
      provider,
      providerId: id,
      email: emails[0].value,
    };
  }
}
