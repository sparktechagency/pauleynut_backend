import { z } from 'zod';
import { progressAlertDayEnum, progressAlertFrequeincyEnum } from './content.enum';
import { query } from 'winston';

const timeRangeSchema = z.object({
     startDate: z.string().datetime().optional(),
     endDate: z.string().datetime().optional(),
});

const founderSchema = z.object({
     name: z.string({ required_error: 'Founder name is required' }),
     role: z.string({ required_error: 'Founder role is required' }),
     bio: z.string({ required_error: 'Founder bio is required' }),
     image: z.string({ required_error: 'Founder image is required' }).url('Invalid image URL'),
});

const userLevelStrategySchema = z.object({
     level: z.string({ required_error: 'Level is required' }),
     title: z.string({ required_error: 'Title is required' }),
     description: z.string({ required_error: 'Description is required' }),
     benefits: z.array(z.string()).min(1, 'At least one benefit is required').optional(),

     targetInvitation: z.number({ required_error: 'Target invitation is required' }).int().min(0),
     targetDonation: z.number({ required_error: 'Target donation is required' }).min(0),
     targetRaising: z.number({ required_error: 'Target raising is required' }).min(0),
});

const privacyPolicySchema = z.object({
     whatWeCollect: z.string({ required_error: 'What we collect is required' }),
     howWeUseIt: z.string({ required_error: 'How we use it is required' }),
     yourAnonymity: z.string({ required_error: 'Your anonymity information is required' }),
     whoSeesYourInfo: z.string({ required_error: 'Who sees your info is required' }),
     security: z.string({ required_error: 'Security information is required' }),
     yourChoices: z.string({ required_error: 'Your choices information is required' }),
});

export const createContentValidation = z.object({
     body: z.object({
          // App Information
          appName: z.string({ required_error: 'App name is required' }),
          logo: z.string({ required_error: 'Logo URL is required' }).url('Invalid logo URL'),

          // About Section
          founders: z.array(founderSchema).min(1, 'At least one founder is required'),
          ourMission: z.string({ required_error: 'Our mission is required' }),
          howWeOperate: z.string({ required_error: 'How we operate is required' }),
          aboutRefugeForWomen: z.string({ required_error: 'About Refuge for Women is required' }),
          introduction: z.string({ required_error: 'Introduction is required' }),

          // Statistics
          citiesServed: z.number({ required_error: 'Cities served is required' }).int().min(0),
          yearsOfOperation: z.number({ required_error: 'Years of operation is required' }).int().min(0),
          survivorsSupported: z.number({ required_error: 'Survivors supported is required' }).int().min(0),

          // User Level Strategy
          userLevelStrategy: z.array(userLevelStrategySchema).min(1, 'At least one user level strategy is required'),

          notificationStrategy: z.object({
               campaignExpiredAlert: z.boolean(),
               lowProgressWarning: z.boolean(),
               mileStoneAlert: z.boolean(),
               mileStoneAlertMessage: z.string(),
               weeklyProgressAlert: z.boolean(),
               weeklyProgressAlertMessage: z.string(),
          }),

          // Media
          gallery: z.array(z.string().url('Invalid image URL')).optional(),

          // Privacy Policy
          privacyPolicy: privacyPolicySchema,
     }),
});

export const updateContentValidation = z.object({
     body: z.object({
          // App Information
          appName: z.string().optional(),
          logo: z.string().url('Invalid logo URL').optional(),

          // About Section
          founders: z.array(founderSchema).min(1, 'At least one founder is required').optional(),
          ourMission: z.string().optional(),
          howWeOperate: z.string().optional(),
          aboutRefugeForWomen: z.string().optional(),
          introduction: z.string().optional(),

          // Statistics
          citiesServed: z.number().int().min(0).optional(),
          yearsOfOperation: z.number().int().min(0).optional(),
          survivorsSupported: z.number().int().min(0).optional(),

          // User Level Strategy
          userLevelStrategy: z.array(userLevelStrategySchema).min(1, 'At least one user level strategy is required').optional(),

          notificationStrategy: z
               .object({
                    campaignExpiredAlert: z.boolean().optional(),
                    lowProgressWarning: z.boolean().optional(),
                    mileStoneAlert: z.boolean().optional(),
                    mileStoneAlertMessage: z.string().optional(),
                    weeklyProgressAlert: z.boolean().optional(),
                    weeklyProgressAlertMessage: z.string().optional(),
               })
               .optional(),

          // Media
          gallery: z.array(z.string().url('Invalid image URL')).optional(),

          // Privacy Policy
          privacyPolicy: privacyPolicySchema.optional(),
     }),
});

// Time range query schema for API requests
export const timeRangeQuerySchema = z.object({
     query: z
          .object({
               endDate: z.string(),
               startDate: z.string(),
          })
          .superRefine(async (data, ctx) => {
               const datePattern = /^\d{4}-\d{2}-\d{2}$/;
               if (!datePattern.test(data.startDate)) {
                    ctx.addIssue({
                         path: ['startDate'],
                         message: 'Start date should be in format yyyy-mm-dd',
                         code: z.ZodIssueCode.custom,
                    });
               }
               if (!datePattern.test(data.endDate)) {
                    ctx.addIssue({
                         path: ['endDate'],
                         message: 'End date should be in format yyyy-mm-dd',
                         code: z.ZodIssueCode.custom,
                    });
               }
          }),
});

// Export all validations
export const ContentValidation = {
     createContentValidation,
     updateContentValidation,
     timeRangeSchema,
     timeRangeQuerySchema,
};
