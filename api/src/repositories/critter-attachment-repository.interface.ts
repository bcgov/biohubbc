export type CritterCaptureAttachmentPayload = {
  critter_id: number;
  critterbase_capture_id: string;
  file: Express.Multer.File;
  key: string;
};

export type CritterMortalityAttachmentPayload = {
  critter_id: number;
  critterbase_mortality_id: string;
  file: Express.Multer.File;
  key: string;
};
