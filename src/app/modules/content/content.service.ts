import { StatusCodes } from 'http-status-codes';
import { IContent, IContentResponse } from './content.interface';
import { Content } from './content.model';
import AppError from '../../../errors/AppError';

const createContent = async (payload: IContent) => {
     // Check if content already exists
     const existingContent = await Content.findOne();
     if (existingContent) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Content already exists. Use update instead.');
     }

     const result = await Content.create(payload);
     return result.toJSON();
};

const getContent = async () => {
     const result = await Content.findOne();

     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Content not found');
     }

     return result.toJSON();
};

const updateContent = async (payload: Partial<IContent>) => {
     // Find the existing content
     const existingContent = await Content.findOne();

     if (!existingContent) {
          // If no content exists, create new one
          const newContent = await Content.create(payload);
          return newContent.toJSON();
     }

     // Update existing content
     Object.assign(existingContent, payload);
     await existingContent.save();

     return existingContent.toJSON();
};

export const ContentService = {
     createContent,
     getContent,
     updateContent,
};
