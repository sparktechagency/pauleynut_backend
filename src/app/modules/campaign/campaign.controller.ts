import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { campaignService } from './campaign.service';

const createCampaign = catchAsync(async (req: Request, res: Response) => {
     const result = await campaignService.createCampaign(req.body, req.user);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Campaign created successfully',
          data: result,
     });
});

const getAllCampaigns = catchAsync(async (req: Request, res: Response) => {
     const result = await campaignService.getAllCampaigns(req.query);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Campaigns retrieved successfully',
          data: result,
     });
});

const getAllUnpaginatedCampaigns = catchAsync(async (req: Request, res: Response) => {
     const result = await campaignService.getAllUnpaginatedCampaigns();

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Campaigns retrieved successfully',
          data: result,
     });
});

const updateCampaign = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await campaignService.updateCampaign(id, req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Campaign updated successfully',
          data: result || undefined,
     });
});

const deleteCampaign = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await campaignService.deleteCampaign(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Campaign deleted successfully',
          data: result || undefined,
     });
});

const hardDeleteCampaign = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await campaignService.hardDeleteCampaign(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Campaign deleted successfully',
          data: result || undefined,
     });
});

const getCampaignById = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await campaignService.getCampaignById(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Campaign retrieved successfully',
          data: result,
     });
});

const getCauseOfCampaignById = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await campaignService.getCauseOfCampaignById(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Campaign retrieved successfully',
          data: result,
     });
});

const invitePeopleToCampaign = catchAsync(async (req: Request, res: Response) => {
     const { campaignId } = req.params;

     const result = await campaignService.invitePeopleToCampaign(req.body, req.user, campaignId);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'People invited to campaign successfully',
          data: result,
     });
});

const alertAboutCampaign = catchAsync(async (req: Request, res: Response) => {
     const { campaignId } = req.params;

     const result = await campaignService.alertAboutCampaign(req.body, campaignId);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Alert set successfully',
          data: result,
     });
});

export const campaignController = {
     createCampaign,
     getAllCampaigns,
     getAllUnpaginatedCampaigns,
     updateCampaign,
     deleteCampaign,
     hardDeleteCampaign,
     getCampaignById,
     getCauseOfCampaignById,
     invitePeopleToCampaign,
     alertAboutCampaign,
};
