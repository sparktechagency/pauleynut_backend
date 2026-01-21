import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ContentService } from './content.service';
import { StatusCodes } from 'http-status-codes';

const upsertContent = catchAsync(async (req: Request, res: Response) => {
     console.log('files', req.files);
     const files = req.files as any;

     const contentData = req.body;

     // console.log("req?.files?.logo", req?.files?.logo);

     if (files && files.logo && files.logo.length > 0) {
          const file = files.logo[0];
          const relativePath = `/logo/${file.filename}`;
          contentData.logo = relativePath;
     }

     if (files && files.images && files.images.length > 0) {
          contentData.images = files.images.map((file: any) => {
               return `/images/${file.filename}`;
          });
     }

     if (files && files.gallery && files.gallery.length > 0) {
          contentData.gallery = files.gallery.map((file: any) => {
               return `/gallery/${file.filename}`;
          });
     }

     // Handle founder image upload - only set image field
     if (files && files.image && files.image.length > 0) {
          const file = files.image[0];

          // Ensure founders array exists
          if (!contentData.founders) {
               contentData.founders = [{}];
          } else if (!contentData.founders[0]) {
               contentData.founders[0] = {};
          }

          // Only set the image field
          contentData.founders[0].image = `/image/${file.filename}`;
     }

     const result = await ContentService.upsertContent(contentData);

     sendResponse(res, {
          statusCode: result.isNew ? StatusCodes.CREATED : StatusCodes.OK,
          success: true,
          message: result.isNew ? 'Content created successfully' : 'Content updated successfully',
          data: result.data,
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

// User Level Strategy CRUD operations
const createUserLevelStrategy = catchAsync(async (req: Request, res: Response) => {
     const strategyData = req.body;
     const result = await ContentService.createUserLevelStrategy(strategyData);

     sendResponse(res, {
          statusCode: StatusCodes.CREATED,
          success: true,
          message: 'User level strategy created successfully',
          data: result,
     });
});

const getUserLevelStrategies = catchAsync(async (req: Request, res: Response) => {
     const result = await ContentService.getUserLevelStrategies();

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'User level strategies retrieved successfully',
          data: result,
     });
});

const getUserLevelStrategyById = catchAsync(async (req: Request, res: Response) => {
     const { strategyId } = req.params;
     const result = await ContentService.getUserLevelStrategyById(strategyId);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'User level strategy retrieved successfully',
          data: result,
     });
});

const updateUserLevelStrategy = catchAsync(async (req: Request, res: Response) => {
     const { strategyId } = req.params;
     const strategyData = req.body;
     const result = await ContentService.updateUserLevelStrategy(strategyId, strategyData);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'User level strategy updated successfully',
          data: result,
     });
});

const deleteUserLevelStrategy = catchAsync(async (req: Request, res: Response) => {
     const { strategyId } = req.params;
     const result = await ContentService.deleteUserLevelStrategy(strategyId);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'User level strategy deleted successfully',
          data: result,
     });
});

export const ContentController = {
     upsertContent,
     getContent,
     getTimeRangeStats,
     getDonationGrowthData,
     createUserLevelStrategy,
     getUserLevelStrategies,
     getUserLevelStrategyById,
     updateUserLevelStrategy,
     deleteUserLevelStrategy,
};
