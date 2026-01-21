import { z } from 'zod';
import { InvitationType } from './InvitationHistory.enum';

const createInvitationHistoryZodSchema = z.object({
     body: z
          .object({
               type: z.enum(Object.values(InvitationType) as [string, ...string[]], { required_error: 'Invitation type is required' }),
               campaignId: z.string({ required_error: 'Campaign ID is required' }),
               isDonated: z.boolean().optional(),
               campaignTitle: z.string().optional(),
               referralLink: z.string().url('Invalid referral link URL').optional(),
               invitationFromUser: z.string({ required_error: 'Inviting user ID is required' }),
               invitationFromPhone: z
                    .string({ required_error: 'Inviting phone number is required' })
                    .min(8, 'Phone number must be at least 8 characters')
                    .max(20, 'Phone number cannot be longer than 20 characters'),
               invitationForPhone: z
                    .string({ required_error: 'Recipient phone number is required' })
                    .min(8, 'Phone number must be at least 8 characters')
                    .max(20, 'Phone number cannot be longer than 20 characters'),
               invitationForName: z.string({ required_error: 'Recipient name is required' }).min(2, 'Name must be at least 2 characters').max(100, 'Name cannot be longer than 100 characters'),
          })

          .superRefine(async (data, ctx) => {
               if (data.type === InvitationType.invitation && !data.campaignId) {
                    ctx.addIssue({
                         path: ['campaignId'],
                         message: 'Campaign ID is required for invitation',
                         code: z.ZodIssueCode.custom,
                    });
               }
          }),
});

const updateInvitationHistoryZodSchema = z.object({
     body: z.object({
          type: z.enum(Object.values(InvitationType) as [string, ...string[]]).optional(),
          campaignId: z.string().optional(),
          referralLink: z.string().url('Invalid referral link URL').optional(),
          invitationFromUser: z.string().optional(),
          invitationForPhone: z.string().min(8, 'Phone number must be at least 8 characters').max(20, 'Phone number cannot be longer than 20 characters').optional(),
          invitationForName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot be longer than 100 characters').optional(),
     }),
});

export const InvitationHistoryValidation = {
     createInvitationHistoryZodSchema,
     updateInvitationHistoryZodSchema,
};
