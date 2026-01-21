import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { SettingService } from "./Setting.Service";
import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import { PrivacyPolicy } from "./Setting.model";

const createTerms = async (req: Request, res: Response) => {
  try {
    const { type, title, content } = req.body;

    if (!type) {
      throw new Error("Setting type is required");
    }

    const result = await SettingService.createTerms({ type, title, content });

    res.status(StatusCodes.OK).json({
      success: true,
      message: `${type} Created successfully`,
      data: result,
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

// Create or update
const updateSetting = async (req: Request, res: Response) => {
  try {
    const { type, title, content } = req.body;
    const { id } = req.params;

    if (!type) {
      throw new Error("Setting type is required");
    }

    const result = await SettingService.updateSetting({ type, title, content, id });

    res.status(StatusCodes.OK).json({
      success: true,
      message: `${type} updated successfully`,
      data: result,
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};



const getPrivacyPolicy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await SettingService.getPrivacyPolicy(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Privacy policy fetched successfully",
      data: result
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
};

const deletePrivacyPolicy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await SettingService.deletePrivacyPolicy(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Privacy policy deleted successfully",
      data: result
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
}
const getAllPrivacyPolicy = async (req: Request, res: Response) => {
  try {
    const result = await PrivacyPolicy.find();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Privacy policy fetched successfully",
      data: result
    });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    });
  }
}

export const SettingController = {
  updateSetting,
  createTerms,
  getPrivacyPolicy,
  deletePrivacyPolicy,
  getAllPrivacyPolicy
};
