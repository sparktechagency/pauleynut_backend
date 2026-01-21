import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import AppError from '../../../errors/AppError';
import { IUser, UserModel } from './user.interface';
import { UserLevel } from './user.enum';

const userSchema = new Schema<IUser, UserModel>(
     {
          name: {
               type: String,
               required: true,
          },
          role: {
               type: String,
               enum: Object.values(USER_ROLES),
               default: USER_ROLES.USER,
          },
          email: {
               type: String,
               required: function (this: IUser) {
                    return this.role === USER_ROLES.SUPER_ADMIN || this.role === USER_ROLES.ADMIN;
               },
               lowercase: true,
          },
          contact: {
               type: String,
               required: function (this: IUser) {
                    return this.role !== USER_ROLES.SUPER_ADMIN && this.role === USER_ROLES.ADMIN;
               },
               unique: true,
               lowercase: true,
          },

          password: {
               type: String,
               required: function (this: IUser) {
                    return this.role === USER_ROLES.SUPER_ADMIN || this.role === USER_ROLES.ADMIN; // only required if NOT oauth user or SUPER_ADMIN or ADMIN
                    // return !this.oauthProvider; // only required if NOT oauth user or SUPER_ADMIN or ADMIN
               },
               select: false,
               minlength: 8,
          },
          image: {
               type: String,
               default: '',
          },
          status: {
               type: String,
               enum: ['active', 'blocked'],
               default: 'active',
          },
          verified: {
               type: Boolean,
               default: false,
          },
          isDeleted: {
               type: Boolean,
               default: false,
          },
          stripeCustomerId: {
               type: String,
               default: '',
          },
          // OAuth fields
          googleId: {
               type: String,
               sparse: true,
          },
          facebookId: {
               type: String,
               sparse: true,
          },
          oauthProvider: {
               type: String,
               enum: ['google', 'facebook'],
          },
          authentication: {
               type: {
                    isResetPassword: {
                         type: Boolean,
                         default: false,
                    },
                    oneTimeCode: {
                         type: Number,
                         default: null,
                    },
                    expireAt: {
                         type: Date,
                         default: null,
                    },
               },
               select: false,
          },
          userLevel: {
               type: String,
               enum: Object.values(UserLevel),
               default: UserLevel.L0,
          },
          totalRaised: {
               type: Number,
               default: 0,
          },
          totalDonated: {
               type: Number,
               default: 0,
          },
          totalInvited: {
               type: Number,
               default: 0,
          },
          totalLogin: {
               type: Number,
               default: 0,
          },
     },
     { timestamps: true },
);



// Exist User Check
userSchema.statics.isExistUserById = async (id: string) => {
     return await User.findById(id);
};

userSchema.statics.isExistUserByEmail = async (email: string) => {
     return await User.findOne({ email });
};
userSchema.statics.isExistUserByContact = async (contact: string) => {
     return await User.findOne({ contact });
};
// Password Matching
userSchema.statics.isMatchPassword = async (password: string, hashPassword: string): Promise<boolean> => {
     return await bcrypt.compare(password, hashPassword);
};

// Pre-Save Hook for Hashing Password & Checking Email Uniqueness
userSchema.pre('save', async function (next) {
     // Only check email uniqueness if this is a new user or email is being changed
     if (this.get('email') && (this.isNew || this.isModified('email'))) {
          const existingUser = await User.findOne({ email: this.get('email') });
          console.log("🚀 ~ this.get('email'):", this.get('email'));
          console.log('🚀 ~ existingUser:', existingUser);
          if (existingUser && existingUser._id.toString() !== this._id.toString()) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Email already exists!');
          }
     }

     // Only hash password if it's provided and modified
     if (this.password && this.isModified('password')) {
          this.password = await bcrypt.hash(this.password, Number(config.bcrypt_salt_rounds));
     }

     // Auto-verify OAuth users
     if (this.oauthProvider && !this.verified) {
          this.verified = true;
     }

     next();
});

// Query Middleware
userSchema.pre('find', function (next) {
     this.find({ isDeleted: { $ne: true } });
     next();
});

userSchema.pre('findOne', function (next) {
     this.find({ isDeleted: { $ne: true } });
     next();
});

userSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});
export const User = model<IUser, UserModel>('User', userSchema);
