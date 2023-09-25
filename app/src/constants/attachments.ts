export enum AttachmentType {
  REPORT = 'Report',
  KEYX = 'KeyX',
  OTHER = 'Other'
}

export enum AttachmentStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  SECURED = 'SECURED',
  UNSECURED = 'UNSECURED',
  SUBMITTED = 'SUBMITTED'
}

export enum PublishStatus {
  NO_DATA = 'NO_DATA',
  UNSUBMITTED = 'UNSUBMITTED',
  SUBMITTED = 'SUBMITTED'
}

export enum ProjectSurveyAttachmentValidExtensions {
  AUDIO = '.wav, .mp3, .mp4, .wma',
  DATA = '.txt, .xls, .xlsx, .xlsm, .xlsb, .accdb, .mdb, .ods, .csv',
  IMAGE = '.gif, .png, .jpg, .jpeg, .svg, .tiff, .bmp, .tif',
  KEYX = '.keyx, .zip',
  REPORT = '.doc, .docx, .pdf',
  SPATIAL = '.kml, .gpx, .zip',
  VIDEO = '.mp4, .mov, .wmv, .ave',
  OTHER = '.wav, .mp3, .mp4, .wma, .txt, .xls, .xlsx, .xlsm, .xlsb, .accdb, .mdb, .ods, .csv, .gif, .png, .jpg, .jpeg, .svg, .tiff, .bmp, .tif, .doc, .docx, .kml, .gdb, .lyr, .shp, .las, .laz, .zlas, .gml, .gpx, .json, .mp4, .mov, .wmv, .ave'
}
