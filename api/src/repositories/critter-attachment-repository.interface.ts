export type CritterCaptureAttachmentPayload = {
  critter_id: number;
  critterbase_capture_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  key: string;
};

export type CritterMortalityAttachmentPayload = {
  critter_id: number;
  critterbase_mortality_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  key: string;
};
