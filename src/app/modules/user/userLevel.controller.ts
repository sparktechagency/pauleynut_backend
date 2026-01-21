import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserLevelService } from './userLevel.service';

const calculateAndUpdateUserLevel = catchAsync(async (req, res) => {
     const user: any = req.user;
     const result = await UserLevelService.calculateAndUpdateUserLevel(user.id);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'User level calculated and updated successfully',
          data: result,
     });
});

const getUserLevelStatus = catchAsync(async (req, res) => {
     const user: any = req.user;
     const result = await UserLevelService.getUserLevelStatus(user.id);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'User level status retrieved successfully',
          data: result,
     });
});

export const UserLevelController = {
     calculateAndUpdateUserLevel,
     getUserLevelStatus,
};
