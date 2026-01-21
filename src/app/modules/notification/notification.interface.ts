import { Types } from 'mongoose';

export interface INotification {
     title?: string;
     message: string;
     receiver: Types.ObjectId;
     reference?: string;
     referenceModel?: 'PAYMENT' | 'ORDER' | 'MESSAGE' | 'REFUND' | 'ALERT' | 'DELIVERY' | 'CANCELLED';
     screen?: 'DASHBOARD' | 'PAYMENT_HISTORY' | 'PROFILE';
     read: boolean;
     type?: 'ADMIN' | 'SYSTEM' | 'PAYMENT' | 'MESSAGE' | 'ALERT' | 'REFUND' | 'ORDER' | 'DELIVERY' | 'CANCELLED';
}
