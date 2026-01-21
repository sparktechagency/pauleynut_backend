import mongoose from 'mongoose';
import { Content } from '../app/modules/content/content.model';
import { UserLevel } from '../app/modules/user/user.enum';
import { progressAlertDayEnum, progressAlertFrequeincyEnum } from '../app/modules/content/content.enum';
import { logger } from '../shared/logger';
import colors from 'colors';
import { Types } from 'mongoose';
import config from '../config';

// Default content data to seed
const contentData = {
     // App Information
     appName: 'Paul Eynuts',
     logo: 'default-logo.png',
     type: 'content',

     // About Section
     ourMission: 'Our mission is to support and empower individuals through community-driven initiatives and resources.',
     howWeOperate: 'We operate through a network of dedicated volunteers and partners who work together to make a difference.',
     introduction: 'Welcome to our platform where we connect people with the resources they need to thrive.',
     foundersQuote: 'Together, we can make a lasting impact on the lives of those who need it most.',

     // About the case
     title: 'Making a Difference Together',
     subTitle: 'Join us in our mission to create positive change',
     organizationName: 'Paul Eynuts Foundation',
     established: new Date('2020-01-01'),
     network: 'Global',
     missionSummary: 'Empowering communities through support and resources',
     aboutRefugeForWomen: 'Dedicated to supporting and empowering women in need',
     images: [],

     // Statistics
     citiesServed: 10,
     yearsOfOperation: 3,
     survivorsSupported: 1000,

     // User Level Strategy
     userLevelStrategy: [
          {
               level: UserLevel.L1,
               title: 'Level 1 Supporter',
               description: 'Entry level supporter',
               benefits: 'Basic access to resources',
               targetInvitation: 5,
               targetDonation: 100,
               targetRaising: 1000,
          },
          {
               level: UserLevel.L3,
               title: 'Level 3 Supporter',
               description: 'Dedicated supporter',
               benefits: 'Enhanced access to resources',
               targetInvitation: 15,
               targetDonation: 500,
               targetRaising: 5000,
          },
          {
               level: UserLevel.L5,
               title: 'Level 5 Supporter',
               description: 'Premium supporter',
               benefits: 'Full access to all resources',
               targetInvitation: 30,
               targetDonation: 1000,
               targetRaising: 10000,
          },
     ],

     // Notification Strategy
     notificationStrategy: {
          campaignExpiredAlert: true,
          lowProgressWarning: true,
          mileStoneAlert: true,
          mileStoneAlertMessage: 'Campaign Milestone Alert',
          progressAlert: true,
          progressAlertMessage: 'Campaign Progress Alert',
          progressAlertSchedule: {
               frequency: progressAlertFrequeincyEnum.weekly,
               day: progressAlertDayEnum.monday,
               time: '10:00',
          },
          campaignId: new Types.ObjectId(),
     },

     // Privacy Policy
     privacyPolicy: {
          whatWeCollect: 'We collect basic user information to provide and improve our services.',
          howWeUseIt: 'We use the information to personalize your experience and improve our platform.',
          yourAnonymity: 'Your personal information is kept confidential and secure.',
          whoSeesYourInfo: 'Only authorized personnel have access to your information.',
          security: 'We implement security measures to protect your data.',
          yourChoices: 'You can manage your privacy settings in your account.',
     },

     // Media
     gallery: [],

     // Founders
     founders: [
          {
               name: 'John Doe',
               role: 'Co-Founder',
               bio: 'Passionate about making a difference',
               image: 'founder1.jpg',
          },
          {
               name: 'Jane Smith',
               role: 'Co-Founder',
               bio: 'Dedicated to community empowerment',
               image: 'founder2.jpg',
          },
     ],
};

// Function to seed content
const seedContent = async () => {
     try {
          // Check if content already exists
          const existingContent = await Content.findOne();
          if (existingContent) {
               logger.info(colors.yellow('⚠️ Content already exists. Returning existing content.'));
               return existingContent;
          }

          // Create a new Content document
          const content = new Content(contentData);

          // Save the content document to the database
          await content.save();

          // Log success message
          logger.info(colors.green('✨ --------------> Content seeded successfully <-------------- ✨'));
          return content;
     } catch (err) {
          // Log error message
          logger.error(colors.red('💥 Error seeding content: 💥'), err);
     }
};

// Connect to MongoDB
const seedDatabase = async () => {
     try {
          logger.info(colors.cyan('🎨 --------------> Database seeding started <--------------- 🎨'));

          // Start seeding content
          await seedContent();
          logger.info(colors.green('🎉 --------------> Database seeding completed <--------------- 🎉'));
     } catch (error) {
          logger.error(colors.red('🔥 Error seeding database: 🔥'), error);
     } finally {
          mongoose.disconnect();
     }
};

// Connect to MongoDB
mongoose
     .connect(config.database_url as string)
     .then(() => {
          seedDatabase();
     })
     .catch((err) => {
          logger.error(colors.red('🔥 MongoDB connection failed: 🔥'), err);
     });
