import { DAY_MAP } from './days.constant';

export type Frequency = 'weekly' | 'biweekly' | 'monthly';

export const getCronExpression = (frequency: Frequency, day: string, hour = 10): string => {
     const dayOfWeek = DAY_MAP[day.toLowerCase()];

     if (dayOfWeek === undefined) {
          throw new Error(`Invalid day: ${day}`);
     }

     // Weekly
     if (frequency === 'weekly') {
          return `0 ${hour} * * ${dayOfWeek}`;
     }

     // Bi-weekly → handled inside job
     if (frequency === 'biweekly') {
          return `0 ${hour} * * ${dayOfWeek}`;
     }

     // Monthly → handled inside job
     if (frequency === 'monthly') {
          return `0 ${hour} * * ${dayOfWeek}`;
     }

     throw new Error('Invalid frequency');
};
