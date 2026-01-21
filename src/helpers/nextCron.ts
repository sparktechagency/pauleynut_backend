import { CronExpressionParser } from 'cron-parser';

export function getNextCronTime(cronExpression: string): Date {
    try {
        const interval = CronExpressionParser.parse(cronExpression, {
            currentDate: new Date(),
            tz: 'Asia/Dhaka'
        });

        return interval.next().toDate();
    } catch (error) {
        console.error('Error parsing cron expression:', error);
        return new Date();
    }
}




export function getTimeUntil(futureDate: Date): string {
    const now = new Date();
    const diff = futureDate.getTime() - now.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
        return `${days} days, ${hours} hours, ${minutes} minutes`;
    } else if (hours > 0) {
        return `${hours} hours, ${minutes} minutes`;
    } else {
        return `${minutes} minutes`;
    }
}