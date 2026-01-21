import { z } from 'zod';
import { CampaignStatus } from './campaign.enum';

const commonFields = {
     targetAmount: z.number().min(0, 'Target amount must be a positive number'),
     startDate: z
          .string()
          .or(z.date())
          .transform((val) => new Date(val)),
     endDate: z
          .string()
          .or(z.date())
          .transform((val) => new Date(val)),
     description: z.string().min(10, 'Description must be at least 10 characters'),
     title: z.string().min(3, 'Title must be at least 3 characters'),
     address: z.string().min(5, 'Address is required').optional(),
     donor_name: z.string().min(2, 'Donor name is required').optional(),
     dafPartner: z.string().optional(),
     internalTrackingId: z.string().optional(),
     campaignStatus: z.nativeEnum(CampaignStatus).optional(),
     organization_name: z.string().min(2, 'Organization name is required'),
     organization_network: z.string().optional(),
     organization_type: z.string().optional(),
     organization_taxId: z.string().optional(),
     organization_website: z.string().url('Invalid website URL').or(z.literal('')).optional(),
     organization_address: z.string().optional(),
     contactPerson_name: z.string().min(2, 'Contact person name is required'),
     contactPerson_title: z.string().optional(),
     contactPerson_email: z.string().email('Invalid email address'),
     contactPerson_phone: z.string().optional(),
     cause_title: z.string().min(3, 'Cause title is required'),
     cause_description: z.string().min(10, 'Cause description is required'),
     cause_mission: z.string().optional(),
     // cause_image: z.string().url('Invalid image URL').or(z.literal('')).optional(),
     alert: z.string().optional(),
     message: z.string().optional(),

     established: z.string().optional(),
     network: z.string().optional(),
     missionSummary: z.string().optional(),
     about: z.string().optional(),
     citiesServed: z.number().optional(),
     yearsOfOperation: z.number().optional(),
     survivorsSupported: z.number().optional(),
     totalInvitees: z.number().optional(),
     images: z.array(z.string()).optional(),
};

const createCampaignZodSchema = z.object({
     body: z.object(commonFields).refine(
          (data) => {
               const startDate = new Date(data.startDate);
               const endDate = new Date(data.endDate);
               return endDate > startDate;
          },
          {
               message: 'End date must be after start date',
               path: ['endDate'],
          },
     ),
});

const updateCampaignZodSchema = z.object({
     body: z
          .object({
               ...commonFields,
               startDate: z
                    .string()
                    .or(z.date())
                    .transform((val) => new Date(val))
                    .optional(),
               endDate: z
                    .string()
                    .or(z.date())
                    .transform((val) => new Date(val))
                    .optional(),
               contactPerson_email: z.string().email('Invalid email address').optional(),
               alert: z.string().optional(),
               message: z.string().optional(),
          })
          .refine(
               (data) => {
                    if (data.startDate && data.endDate) {
                         const startDate = new Date(data.startDate);
                         const endDate = new Date(data.endDate);
                         return endDate > startDate;
                    }
                    return true;
               },
               {
                    message: 'End date must be after start date',
                    path: ['endDate'],
               },
          ),
});

const invitePeopleToCampaignZodSchema = z.object({
     body: z
          .object({
               myInvitees: z
                    .array(
                         z.object({
                              invitationForPhone: z
                                   .string()
                                   .min(8, 'Phone number must be at least 8 characters')
                                   .max(20, 'Phone number cannot be longer than 20 characters')
                                   .describe('Phone number of the invitee'),
                              invitationForName: z
                                   .string()
                                   .min(2, 'Name must be at least 2 characters')
                                   .max(100, 'Name cannot be longer than 100 characters')
                                   .describe('Optional name for the invitee'),
                         }),
                    )
                    .min(3, 'At least three phone numbers are required for invitation')
                    .max(
                         12,
                         'Maximum 12 phone numbers allowed for invitation per batch (3-12) for optimal performance and system stability. Please batch your invitations for better performance and reliability. Contact support if you need to invite more users.',
                    ),
               donationAmount: z.number().min(1, 'Donation amount must be at least 1').optional(),
               paymentMethod: z.string().describe('Payment method for the donation').optional(),
               invitationIrecievedFrom: z.string().describe('Invitation from'),
          })
          .superRefine((data, ctx) => {
               if (data.donationAmount && !data.paymentMethod) {
                    ctx.addIssue({
                         code: z.ZodIssueCode.custom,
                         path: ['paymentMethod'],
                         message: 'Payment method is required when donation amount is provided',
                    });
               }
          }),

     params: z.object({
          campaignId: z.string().describe('Campaign ID'),
     }),
});

const alertAboutCampaignZodSchema = z.object({
     body: z.object({
          alert: z.string(),
          message: z.string(),
     }),
     params: z.object({
          campaignId: z.string().describe('Campaign ID'),
     }),
});

export const campaignValidation = {
     createCampaignZodSchema,
     updateCampaignZodSchema,
     invitePeopleToCampaignZodSchema,
     alertAboutCampaignZodSchema,
};
