import { createClient } from '@base44/sdk';
import { config } from '../config/index.js';

const { appId, serverUrl, token, functionsVersion } = config.externalService;

// Create an external service client instance
export const externalServiceClient = createClient({
  appId,
  serverUrl,
  token,
  functionsVersion,
  requiresAuth: false
});

// Export individual services for easier use
export const Query = externalServiceClient.entities.Query;
export const User = externalServiceClient.auth;
export const Core = externalServiceClient.integrations.Core;
export const InvokeLLM = externalServiceClient.integrations.Core.InvokeLLM;
export const SendEmail = externalServiceClient.integrations.Core.SendEmail;
export const UploadFile = externalServiceClient.integrations.Core.UploadFile;
export const GenerateImage = externalServiceClient.integrations.Core.GenerateImage;
export const ExtractDataFromUploadedFile = externalServiceClient.integrations.Core.ExtractDataFromUploadedFile;