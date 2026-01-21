import { string, z } from 'zod';
import { USER_ROLES } from '../../../enums/user';

export const createUserZodSchema = z.object({
     body: z
          .object({
               name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters long'),
               contact: string().default(''),
               role: z.nativeEnum(USER_ROLES),
          })
          .superRefine(async (data, ctx) => {
               // Check if the role is not 'USER' and add a custom error
               if (data.role !== USER_ROLES.USER) {
                    ctx.addIssue({
                         path: ['role'],
                         message: 'Role must be user',
                         code: z.ZodIssueCode.custom,
                    });
               }
          }),
});

const createBusinessUserZodSchema = z.object({
     body: z.object({
          name: z.string({ required_error: 'Name is required' }),
          contact: z.string({ required_error: 'Contact is required' }),
          email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
          password: z.string({ required_error: 'Password is required' }).min(8, 'Password must be at least 8 characters long'),
          profile: z.string().optional(),
     }),
});

const updateUserZodSchema = z.object({
     body: z.object({
          name: z.string().optional(),
          contact: z.string().optional(),
          address: z.string().optional(),
          email: z.string().email('Invalid email address').optional(),
          password: z.string().optional(),
          image: z.string().optional(),
     }),
});

export const UserValidation = {
     createUserZodSchema,
     updateUserZodSchema,
     createBusinessUserZodSchema,
};
