import { PrivacyPolicy } from "./Setting.model";

// Create
const createTerms = async (data: { type: string; title: string; content: string }) => {
  const { type, title, content } = data;

  const result = await PrivacyPolicy.create({ type, title, content });

  return result;
};
// Create or update single settings document
const updateSetting = async (data: { type: string; title: string; content: string, id: string }) => {
  const { type, title, content } = data;

  const result = await PrivacyPolicy.findOneAndUpdate(
    { type, _id: data.id },
    { title, content },
    { upsert: true, new: true }
  );

  return result;
};

const getPrivacyPolicy = async (id: string) => {
  const result = await PrivacyPolicy.findById(id);
  if (!result) {
    throw new Error("Privacy policy not found");
  }
  return result;
}
// Delete
const deletePrivacyPolicy = async (id: string) => {
  const result = await PrivacyPolicy.findByIdAndDelete(id);
  if (!result) {
    throw new Error("Privacy policy not found");
  }
  return result;
}



export const SettingService = {
  updateSetting,
  createTerms,
  getPrivacyPolicy,
  deletePrivacyPolicy
};



// // Get all settings (single document)
// const getSettings = async () => {
//   const result = await Settings.findOne();
//   return result;
// };


