import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { Campaign } from './campaign.model';
import QueryBuilder from '../../builder/QueryBuilder';
import unlinkFile from '../../../shared/unlinkFile';
import { ICampaign } from './campaign.interface';
import { User } from '../user/user.model';
import { IInvitationHistory } from '../InvitationHistory/InvitationHistory.interface';
import { InvitationType } from '../InvitationHistory/InvitationHistory.enum';
import { InvitationHistory } from '../InvitationHistory/InvitationHistory.model';
import sendSMS from '../../../shared/sendSMS';
import { ITransaction, paymentStatusType } from '../Transaction/Transaction.interface';
import { Transaction } from '../Transaction/Transaction.model';
import mongoose from 'mongoose';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import { Content } from '../content/content.model';
import { UserLevelStrategy } from '../content/content.interface';
import { USER_ROLES } from '../../../enums/user';
import { INotification } from '../notification/notification.interface';
import { IUser } from '../user/user.interface';
import { CampaignStatus } from './campaign.enum';

const createCampaign = async (payload: ICampaign & { image?: string }): Promise<ICampaign> => {
     const createCampaignDto = {
          ...payload,
          cause_image: payload.image,
     };
     const result = await Campaign.create(createCampaignDto);
     if (!result) {
          if (payload.image) {
               unlinkFile(payload.image);
          }
          throw new AppError(StatusCodes.NOT_FOUND, 'Campaign not found.');
     }
     return result;
};

const getAllCampaigns = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: ICampaign[] }> => {
     const queryBuilder = new QueryBuilder(Campaign.find(), query);
     const result = await queryBuilder.search(['title', 'description', 'cause_title', 'organization_name']).filter().sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedCampaigns = async (): Promise<ICampaign[]> => {
     const result = await Campaign.find();
     return result;
};

const updateCampaign = async (id: string, payload: Partial<ICampaign & { image?: string }>): Promise<ICampaign | null> => {
     const isExist = await Campaign.findById(id);
     if (!isExist) {
          if (payload.image) {
               unlinkFile(payload.image);
          }
          throw new AppError(StatusCodes.NOT_FOUND, 'Campaign not found.');
     }

     if (payload.image && isExist.cause_image) {
          unlinkFile(isExist.cause_image);
     }
     const updateCampaignDto = {
          ...payload,
          cause_image: payload.image,
     };
     return await Campaign.findByIdAndUpdate(id, updateCampaignDto, { new: true });
};

const deleteCampaign = async (id: string): Promise<ICampaign | null> => {
     const result = await Campaign.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Campaign not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteCampaign = async (id: string): Promise<ICampaign | null> => {
     const result = await Campaign.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Campaign not found.');
     }
     if (result.cause_image) {
          unlinkFile(result.cause_image);
     }
     return result;
};

const getCampaignById = async (id: string): Promise<ICampaign | null> => {
     const result = await Campaign.findById(id);
     return result;
};

const invitePeopleToCampaign = async (
     payload: { myInvitees: { invitationForPhone: string; invitationForName?: string }[]; donationAmount?: number; paymentMethod?: string; invitationIrecievedFrom: string }, // totalRaised+
     user: any, // totalDonated+,totalInvited+
     campaignId: string,
) => {
     if (payload.invitationIrecievedFrom.toString() === user.id.toString()) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'You can not invite yourself.');
     }
     const campaign = await Campaign.findById(campaignId);
     if (!campaign) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Campaign not found.Or its already reached its target amount.');
     }
     if (campaign.overall_raised >= campaign.targetAmount) {
          await Campaign.updateOne({ _id: campaign._id }, { campaignStatus: CampaignStatus.COMPLETED });
     }
     // Check Double User
     const isExitUser = await User.findById(user.id);

     if (!isExitUser || !isExitUser.contact) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
     }
     const isExistInvitorUser = await User.findById({ _id: payload.invitationIrecievedFrom });
     if (!isExistInvitorUser) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Invitation User not found.');
     }

     const batchInvitationDto = [];
     // Populate batchInvitationDto with data from payload
     for (const invitee of payload.myInvitees) {
          batchInvitationDto.push({
               type: InvitationType.invitation,
               campaignId: campaign._id,
               invitationFromUser: isExitUser._id,
               invitationFromPhone: isExitUser.contact || '',
               invitationForPhone: invitee.invitationForPhone,
               invitationForName: invitee.invitationForName || '',
               isDonated: payload.donationAmount && payload.donationAmount > 0,
          });

          if (invitee.invitationForPhone) {
               await sendSMS(invitee.invitationForPhone, `You've been invited to join campaign "${campaign.title}". Join now!`);
          }
     }

     const session = await mongoose.startSession();
     session.startTransaction();

     try {
          // Create invitation records (bulk insert)
          await InvitationHistory.insertMany(batchInvitationDto, { session });

          if (payload.donationAmount && payload.donationAmount > 0) {
               const donationDto = {
                    donorId: isExitUser._id,
                    donorPhone: isExitUser.contact || '',
                    paymentMethod: payload.paymentMethod,
                    transactionId: `INV-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                    amountPaid: payload.donationAmount,
                    campaignId: campaign._id,
                    paymentStatus: paymentStatusType.COMPLETED,
               };

               // Create a donation record
               const createdDonation = await Transaction.create([donationDto], { session });
               if (!createdDonation) {
                    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create donation record');
               }

               await User.updateOne({ _id: isExistInvitorUser._id }, { $inc: { totalRaised: payload.donationAmount || 0 } }, { session });

               await User.updateOne({ _id: isExitUser._id }, { $inc: { totalDonated: payload.donationAmount || 0, totalInvited: payload.myInvitees.length } }, { session });

               // update campaign
               await Campaign.updateOne(
                    { _id: campaign._id },
                    {
                         $inc: {
                              overall_raised: payload.donationAmount || 0,
                              total_invitees: payload.myInvitees.length,
                         },
                         $dec: {
                              targetAmount: payload.donationAmount || 0,
                         },
                    },
                    { session },
               );

               // level up the donor
               const levelStrategy = await Content.findOne().select('userLevelStrategy').lean();

               if (levelStrategy?.userLevelStrategy && Array.isArray(levelStrategy.userLevelStrategy) && levelStrategy.userLevelStrategy.length > 0) {
                    const userTotalRaised = isExitUser.totalRaised || 0;
                    const userTotalDonated = isExitUser.totalDonated || 0;
                    const userTotalInvited = isExitUser.totalInvited || 0;

                    // Find the appropriate level based on total raised, donated, and invited
                    const userLevelTobeUpdatedTo = levelStrategy.userLevelStrategy.find(
                         (strategy: UserLevelStrategy) => userTotalRaised >= strategy?.targetRaising && userTotalDonated >= strategy?.targetDonation && userTotalInvited >= strategy?.targetInvitation,
                    );

                    if (userLevelTobeUpdatedTo) {
                         await User.updateOne({ _id: isExitUser._id }, { userLevel: userLevelTobeUpdatedTo.level }, { session });
                    }

                    const invitorTotalRaised = isExistInvitorUser.totalRaised || 0;
                    const invitorTotalDonated = isExistInvitorUser.totalDonated || 0;
                    const invitorTotalInvited = isExistInvitorUser.totalInvited || 0;

                    // Find the appropriate level for the invitor
                    const invitorLevelTobeUpdatedTo = levelStrategy.userLevelStrategy.find(
                         (strategy: UserLevelStrategy) =>
                              invitorTotalRaised >= strategy?.targetRaising && invitorTotalDonated >= strategy?.targetDonation && invitorTotalInvited >= strategy?.targetInvitation,
                    );

                    if (invitorLevelTobeUpdatedTo) {
                         await User.updateOne({ _id: isExistInvitorUser._id }, { userLevel: invitorLevelTobeUpdatedTo.level }, { session });
                    }
               } else {
                    console.log('or strategy is empty');
               }
          }

          // Commit the transaction if everything is successful
          await session.commitTransaction();
          session.endSession();

          // notify to admin
          const admins = await User.find({ role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] } })
               .select('_id')
               .lean();
          for (const element of admins) {
               const notificationData = {
                    title: 'New Donation',
                    referenceModel: 'Transaction' as INotification['referenceModel'],
                    text: `New Donation from ${isExitUser.name}`,
                    type: 'PAYMENT' as INotification['type'],
                    receiver: element._id,
                    message: `New Donation from ${isExitUser.name}`,
                    read: false,
               };

               await sendNotifications(notificationData);
          }

          return {
               message: 'People invited successfully',
               donationAmount: payload.donationAmount && payload.donationAmount > 0 ? payload.donationAmount : undefined,
          };
     } catch (error) {
          console.log('🚀 ~ invitePeopleToCampaign ~ error:', error);

          // Abort the transaction if an error occurs
          await session.abortTransaction();
          session.endSession();

          // Re-throw the error so it can be handled by the calling function
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to process invitation and donation');
     }
};

const alertAboutCampaign = async (payload: Partial<ICampaign>, campaignId: string) => {
     // Step 1: Retrieve and update the campaign
     const campaign = await Campaign.findByIdAndUpdate(campaignId, payload, {
          new: true,
          runValidators: true,
     }).select('alert message crea contactPerson_phone targetAmount overall_raised total_invitees endDate');

     // If campaign not found, throw an error
     if (!campaign) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Campaign not found');
     }

     // Step 2: Fetch campaign histories
     const campaignHistories = await Transaction.find({ campaignId }).select('donorPhone');

     // Step 3: Collect phone numbers (valid and unique)
     const phonesToSendAlert = [campaign.contactPerson_phone, ...campaignHistories.map((transaction: Partial<ITransaction>) => transaction.donorPhone)];

     // Filter out invalid phone numbers (null, undefined, or empty strings)
     const validPhones = phonesToSendAlert.filter((phone): phone is string => {
          // Explicitly check if phone is a string and if it is not empty
          return typeof phone === 'string' && phone.trim() !== '';
     });

     // Get current date
     const now = new Date();

     // Calculate hours remaining until campaign expiry
     const campaignEndDate = new Date(campaign.endDate);
     const remainingHours = Math.max(Math.floor((campaignEndDate.getTime() - now.getTime()) / (1000 * 60 * 60)), 0); // Ensure non-negative hours

     // Prepare the message content
     const messageTemplate = (raisedAmount: number, inviteesCount: number, donorsCount: number) => `
        Your Pass It Along Chain is expiring in ${remainingHours} hours.
        You made a big difference. ${raisedAmount} raised!!
        ${inviteesCount} Invitees, ${donorsCount} Donors.
    `;

     // Step 4: Send SMS to all valid phone numbers
     await Promise.all(
          validPhones.map(async (phone) => {
               try {
                    // Sending SMS with dynamic content
                    await sendSMS(phone, messageTemplate(campaign.overall_raised, campaign.total_invitees, campaignHistories.length));
               } catch (error) {
                    console.error(`Error sending SMS to ${phone}:`, error);
                    // Optionally, you could log the error or handle it based on your needs
               }
          }),
     );

     // Step 5: Log the campaign history for debugging
     console.log('Campaign history:', campaignHistories);
};

export const campaignService = {
     createCampaign,
     getAllCampaigns,
     getAllUnpaginatedCampaigns,
     updateCampaign,
     deleteCampaign,
     hardDeleteCampaign,
     getCampaignById,
     invitePeopleToCampaign,
     alertAboutCampaign,
};
