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

export const ContentController = {
     createContent,
     getContent,
     updateContent,
};
