import { boolean, z } from 'zod';

const createVerifyContactZodSchema = z.object({
     body: z
          .object({
               contact: z.string().optional(),
               email: z.string().optional(),
               oneTimeCode: z.number({ required_error: 'One time code is required' }),
               isForLogin: boolean({ required_error: 'Is for login is required' }),
          })

          .superRefine(async (data, ctx) => {
               // Check if the role is not 'USER' and add a custom error
               if (data.isForLogin && !data.contact) {
                    ctx.addIssue({
                         path: ['contact'],
                         message: 'Contact is required for login',
                         code: z.ZodIssueCode.custom,
                    });
               }

               if (!data.isForLogin && !data.email) {
                    ctx.addIssue({
                         path: ['email'],
                         message: 'Email is required for reset password',
                         code: z.ZodIssueCode.custom,
                    });
               }
          }),
});

const createLoginZodSchema = z.object({
     body: z.object({
          email: z.string({ required_error: 'Email is required' }),
          password: z.string({ required_error: 'Password is required' }),
     }),
});

const createForgetPasswordZodSchema = z.object({
     body: z.object({
          email: z.string({ required_error: 'Email is required' }),
     }),
});

const createResetPasswordZodSchema = z.object({
     body: z.object({
          newPassword: z.string({ required_error: 'Password is required' }),
          confirmPassword: z.string({
               required_error: 'Confirm Password is required',
          }),
     }),
});

const createChangePasswordZodSchema = z.object({
     body: z.object({
          currentPassword: z.string({
               required_error: 'Current Password is required',
          }),
          newPassword: z.string({ required_error: 'New Password is required' }),
          confirmPassword: z.string({
               required_error: 'Confirm Password is required',
          }),
     }),
});

const createResendOtpZodSchema = z.object({
     body: z.object({
          contact: z.string().optional(),
          email: z.string().optional(),
     }),
});

export const AuthValidation = {
     createVerifyContactZodSchema,
     createResendOtpZodSchema,
     createForgetPasswordZodSchema,
     createLoginZodSchema,
     createResetPasswordZodSchema,
     createChangePasswordZodSchema,
};
