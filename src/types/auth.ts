export type IVerifyContact = {
     contact?: string;
     email?: string;
     oneTimeCode: number;
     isForLogin: boolean;
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
