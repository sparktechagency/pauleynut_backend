import { USER_ROLES } from "../enums/user";

export type IVerifyContact = {
     contact?: string;
     email?: string;
     oneTimeCode: number;
     isFromWebsite: boolean;
     campaignId?: string;
     role: USER_ROLES;
};

export type ILoginData = {
     email: string;
     password: string;
};

export type IAuthResetPassword = {
     newPassword: string;
     confirmPassword: string;
};

export type IChangePassword = {
     currentPassword: string;
     newPassword: string;
     confirmPassword: string;
};
