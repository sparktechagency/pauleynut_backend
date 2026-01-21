import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { InvitationHistoryService } from './InvitationHistory.service';

const createInvitationHistory = catchAsync(async (req: Request, res: Response) => {
     const result = await InvitationHistoryService.createInvitationHistory(req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'InvitationHistory created successfully',
          data: result,
     });
});

const getAllInvitationHistorys = catchAsync(async (req: Request, res: Response) => {
     const result = await InvitationHistoryService.getAllInvitationHistorys(req.query);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'InvitationHistorys retrieved successfully',
          data: result,
     });
});

const getAllUnpaginatedInvitationHistorys = catchAsync(async (req: Request, res: Response) => {
     const result = await InvitationHistoryService.getAllUnpaginatedInvitationHistorys();

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'InvitationHistorys retrieved successfully',
          data: result,
     });
});

const updateInvitationHistory = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await InvitationHistoryService.updateInvitationHistory(id, req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'InvitationHistory updated successfully',
          data: result || undefined,
     });
});

const deleteInvitationHistory = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await InvitationHistoryService.deleteInvitationHistory(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'InvitationHistory deleted successfully',
          data: result || undefined,
     });
});

const hardDeleteInvitationHistory = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await InvitationHistoryService.hardDeleteInvitationHistory(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'InvitationHistory deleted successfully',
          data: result || undefined,
     });
});

const getInvitationHistoryById = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await InvitationHistoryService.getInvitationHistoryById(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'InvitationHistory retrieved successfully',
          data: result || undefined,
     });
});  

export const InvitationHistoryController = {
     createInvitationHistory,
     getAllInvitationHistorys,
     getAllUnpaginatedInvitationHistorys,
     updateInvitationHistory,
     deleteInvitationHistory,
     hardDeleteInvitationHistory,
     getInvitationHistoryById
};
