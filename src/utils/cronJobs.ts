import cron from 'node-cron';
import { User } from '../app/modules/user/user.model';
import figlet from 'figlet';
import chalk from 'chalk';
import { Content } from '../app/modules/content/content.model';
// ====== CRON JOB SCHEDULERS ======
// 1. Check for users expiring in 24 hours (send warning email)
const scheduleNotificationForAdmin = () => {
     // Run every day at 9:00 AM '0 9 * * *'
     cron.schedule('*/1 * * * *', async () => {
          try {
               console.log('🔔 Checking for schedule notification 24 hours...');

               const tomorrow = new Date();
               tomorrow.setDate(tomorrow.getDate() + 1);
               tomorrow.setHours(23, 59, 59, 999); // End of tomorrow

               const today = new Date();
               today.setHours(23, 59, 59, 999); // End of today

               // level up the donor ⏰
               const { notificationStrategy } = await Content.findOne().select('notificationStrategy').lean();

               // console.log(`📧 Found ${usersExpiringTomorrow.length} users expiring tomorrow`);
               // console.log('✅ Trial warning emails sent');
          } catch (error) {
               console.error('❌ Error in trial warning check:', error);
          }
     });
};

// ASCII Art Title
figlet('OOAAOW', (err, data) => {
     if (err) {
          console.log('Something went wrong...');
          console.dir(err);
          return;
     }

     // Print the title with color
     console.log(chalk.green(data));

     // Print version info and system details with color
     console.log(chalk.cyan('VERSION INFO:'));
     console.log(chalk.yellow('Template: 1.0'));
     console.log(chalk.magenta('Node.js: v20.11.1'));
     console.log(chalk.blue('OS: ubuntu'));
});
const setupTimeManagement = () => {
     console.log('🚀 Setting up trial management cron jobs...');
     // Start all cron jobs
     scheduleNotificationForAdmin(); // Daily at 9 AM
};
export default setupTimeManagement;
