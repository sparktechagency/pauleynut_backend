import { Model } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
import { UserLevel } from './user.enum';
export type IUser = {
     name: string;
     role: USER_ROLES;
     email?: string;
     contact?: string;
     password?: string;
     image?: string;
     isDeleted: boolean;
     stripeCustomerId: string;
     status: 'active' | 'blocked';
     verified: boolean;
     googleId?: string;
     facebookId?: string;
     oauthProvider?: 'google' | 'facebook';
     authentication?: {
          isResetPassword: boolean;
          oneTimeCode: number;
          expireAt: Date;
     };
     userLevel: UserLevel;
     totalRaised: number;
     totalDonated: number;
     totalInvited: number;
     totalLogin: number;
     invitedBy?: string;
};

export type UserModel = {
     isExistUserById(id: string): any;
     isExistUserByEmail(email: string): any;
     isExistUserByContact(contact: string): any;
     isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
