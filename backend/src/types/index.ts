import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
  query: any;
  params: any;
  file?: any; // Multer file object
  body: any;
}

export interface DefaultSpecies {
  commonNameEn: string;
  commonNameEs: string;
  scientificName: string;
}
