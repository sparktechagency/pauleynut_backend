import { z } from 'zod';
import { progressAlertDayEnum, progressAlertFrequeincyEnum } from './content.enum';

const timeRangeSchema = z.object({
     startDate: z.string().datetime().optional(),
     endDate: z.string().datetime().optional(),
});

/* Founder Schema */
const founderSchema = z.object({
     name: z.string().min(1, 'Founder name is required'),
     role: z.string().min(1, 'Founder role is required'),
     bio: z.string().min(1, 'Founder bio is required'),
     image: z.string().url('Invalid founder image URL'),
});

/* User Level Strategy Schema */
const userLevelStrategySchema = z.object({
     level: z.string().min(1, 'Level must be at least 1'),
     title: z.string().min(1, 'Level title is required'),
     description: z.string().min(1, 'Level description is required'),
     benefits: z.string().min(1, 'At least one benefit is required'),
     targetInvitation: z.number().int().min(0),
     targetDonation: z.number().min(0),
     targetRaising: z.number().min(0),
});

/* Privacy Policy Schema */
const privacyPolicySchema = z.object({
     whatWeCollect: z.string().min(1),
     howWeUseIt: z.string().min(1),
     yourAnonymity: z.string().min(1),
     whoSeesYourInfo: z.string().min(1),
     security: z.string().min(1),
     yourChoices: z.string().min(1),
});

/* Progress Alert Schedule Schema */
const progressAlertScheduleSchema = z.object({
     frequency: z.nativeEnum(progressAlertFrequeincyEnum),
     day: z.nativeEnum(progressAlertDayEnum),
     time: z
          .string()
          .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
          .optional(),
});

/* Notification Strategy Schema */
const notificationStrategySchema = z.object({
     campaignExpiredAlert: z.boolean().optional(),
     lowProgressWarning: z.boolean().optional(),
     mileStoneAlert: z.boolean().optional(),
     mileStoneAlertMessage: z.string().optional(),
     progressAlert: z.boolean().optional(),
     progressAlertMessage: z.string().optional(),
     progressAlertSchedule: progressAlertScheduleSchema.optional(),
     campaignId: z
          .string()
          .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Campaign ID')
          .optional(),
});

/* PUT Validation (Create or Update) */
export const upsertContentValidation = z.object({
     body: z.object({
          // App Info
          appName: z.string().min(1, 'App name is required').optional(),
          logo: z.string().url('Invalid logo URL').optional(),
          type: z.string().optional(),

          // Founders
          founders: z.array(founderSchema).min(1, 'At least one founder is required').optional(),

          // About Section
          introduction: z.string().min(1).optional(),
          ourMission: z.string().min(1).optional(),
          howWeOperate: z.string().min(1).optional(),
          aboutRefugeForWomen: z.string().min(1).optional(),
          network: z.string().min(1).optional(),
          missionSummary: z.string().min(1).optional(),
          foundersQuote: z.string().min(1).optional(),

          // Optional UI Content
          title: z.string().min(1).optional(),
          subTitle: z.string().min(1).optional(),
          organizationName: z.string().min(1).optional(),

          // Date
          established: z.string().datetime('Invalid date format').optional(),

          // Images
          images: z.array(z.string().url('Invalid image URL')).optional(),
          gallery: z.array(z.string().url('Invalid gallery image URL')).optional(),
          // campaignExpiredAlert: z.boolean().optional(),
          // lowProgressWarning: z.boolean().optional(),
          // mileStoneAlert: z.boolean().optional(),
          // mileStoneAlertMessage: z.string().optional(),
          // progressAlert: z.boolean().optional(),
          // progressAlertMessage: z.string().optional(),
          // progressAlertSchedule: progressAlertScheduleSchema.optional(),

          // Statistics
          citiesServed: z.number().int().min(0).optional(),
          yearsOfOperation: z.number().int().min(0).optional(),
          survivorsSupported: z.number().int().min(0).optional(),

          // User Level Strategy
          userLevelStrategy: z.array(userLevelStrategySchema).min(1, 'At least one user level strategy is required').optional(),

          // Notification Strategy

          notificationStrategy: notificationStrategySchema.optional(),

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

// User Level Strategy CRUD validations
export const createUserLevelStrategyValidation = z.object({
     body: userLevelStrategySchema,
});

export const updateUserLevelStrategyValidation = z.object({
     body: userLevelStrategySchema.partial(),
});

export const paramsValidation = z.object({
     params: z.object({
          strategyId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid strategy ID'),
     }),
});

// Export all validations
export const ContentValidation = {
     upsertContentValidation,
     timeRangeSchema,
     timeRangeQuerySchema,
     createUserLevelStrategyValidation,
     updateUserLevelStrategyValidation,
     paramsValidation,
};
