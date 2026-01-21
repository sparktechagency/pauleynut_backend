import express from 'express';
import { TransactionController } from './Transaction.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseFileData from '../../middleware/parseFileData';
import { FOLDER_NAMES } from '../../../enums/files';
import validateRequest from '../../middleware/validateRequest';
import { TransactionValidation } from './Transaction.validation';

const router = express.Router();

router.post('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(TransactionValidation.createTransactionZodSchema), TransactionController.createTransaction);

router.get('/', TransactionController.getAllTransactions);
router.get(
     '/user/:userId',
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
     validateRequest(TransactionValidation.getAllInvitaAndTransactionsOfUserZodSchema),
     TransactionController.getAllInvitaAndTransactionsOfUser,
);

router.get('/unpaginated', TransactionController.getAllUnpaginatedTransactions);

router.post(
     '/send-success-message/:transactionId',
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
     validateRequest(TransactionValidation.sendSuccessMessageZodSchema),
     TransactionController.sendSuccessMessage,
);
// service : await sendSMS(createUser.contact!, `dsfsdfsdffdsf`);
router.delete('/hard-delete/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), TransactionController.hardDeleteTransaction);

router.patch('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(TransactionValidation.updateTransactionZodSchema), TransactionController.updateTransaction);

router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), TransactionController.deleteTransaction);

router.get('/:id', TransactionController.getTransactionById);

export const TransactionRoutes = router;
