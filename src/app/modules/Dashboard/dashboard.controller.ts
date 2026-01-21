import catchAsync from '../../../shared/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import { DashboardService } from './dashboard.service';
import { JwtPayload } from 'jsonwebtoken';

const overview = catchAsync(async (req: Request, res: Response) => {
     const user = req.user;
     const query = req.query;
     const result = await DashboardService.overview(user as JwtPayload, query);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Overview data retrieved successfully',
          data: result,
     });
});
const doner = catchAsync(async (req: Request, res: Response) => {
     const { year } = req.query;
     const result = await DashboardService.getDonationGrowthData(Number(year));

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Doner data retrieved successfully',
          data: result,
     });
});

export const DashboardController = {
     overview,
     doner,
};
