/**
 * Mock R2 Service for stress testing
 * 
 * Mocks Cloudflare R2 interactions without actual cloud storage
 * Allows testing upload flow without occupying space or hitting rate limits
 * 
 * Usage: import and use in tests to avoid actual R2 uploads
 */

let uploadFileResolve: ((value: { success: boolean; key?: string; url?: string }) => void);
let uploadFilePromise: Promise<{ success: boolean; key?: string; url?: string }>;

const mockUploadFile = async (filePath: string, key: string, contentType?: string): Promise<{ success: boolean; key?: string; url?: string }> => {
  if (uploadFileResolve) {
    const result = uploadFileResolve({ success: true, key, url: `https://r2.test/${key}` });
    uploadFileResolve = undefined;
    return result;
  }
  return { success: true, key, url: `https://r2.test/${key}` };
};

const renameObject = async (oldKey: string, newKey: string): Promise<{ success: boolean }> => {
  return { success: true };
};

const isFileTooSmall = (filePath: string): boolean => {
  return false;
};

const getPublicUrl = (key: string): string => {
  return `https://r2.test/${key}`;
};

const uploadFileFn = ((cb: typeof uploadFileResolve) => {
  uploadFileResolve = cb;
  return mockUploadFile;
}) as typeof mockUploadFile;

export function createMockR2Service() {
  return {
    uploadFile: uploadFileFn,
    renameObject,
    isFileTooSmall,
    getPublicUrl,
  };
}
