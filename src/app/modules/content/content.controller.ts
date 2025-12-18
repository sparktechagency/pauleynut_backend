import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ContentService } from './content.service';
import { StatusCodes } from 'http-status-codes';

const createContent = catchAsync(async (req: Request, res: Response) => {
     const { ...contentData } = req.body;
     const result = await ContentService.createContent(contentData);

     sendResponse(res, {
          statusCode: StatusCodes.CREATED,
          success: true,
          message: 'Content created successfully',
          data: result,
     });
});

const getContent = catchAsync(async (req: Request, res: Response) => {
     const result = await ContentService.getContent();

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Content retrieved successfully',
          data: result,
     });
});

const updateContent = catchAsync(async (req: Request, res: Response) => {
     const { ...contentData } = req.body;
     const result = await ContentService.updateContent(contentData);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Content updated successfully',
          data: result,
     });
});

// Get time-range-based statistics
const getTimeRangeStats = catchAsync(async (req: Request, res: Response) => {
     const { startDate, endDate } = req.query;

     const result = await ContentService.getTimeRangeStats(startDate as string | undefined, endDate as string | undefined);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Time range statistics retrieved successfully',
          data: result,
     });
});

// Get donation growth data
const getDonationGrowthData = catchAsync(async (req: Request, res: Response) => {
     const { startDate, endDate } = req.query;

     const result = await ContentService.getDonationGrowthData(startDate as string | undefined, endDate as string | undefined);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Donation growth data retrieved successfully',
          data: result,
     });
});

export const ContentController = {
     createContent,
     getContent,
     updateContent,
     getTimeRangeStats,
     getDonationGrowthData,
};
