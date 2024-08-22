export enum AttachmentType {
  /**
   * Report attachment type.
   */
  REPORT = 'Report',
  /**
   * Telelemetry device type for Vectronic devices.
   */
  KEYX = 'KeyX',
  /**
   * Telelemetry device type for Lotek devices.
   */
  CFG = 'Cfg',
  /**
   * Other attachment type.
   */
  OTHER = 'Other'
}

export enum PublishStatus {
  NO_DATA = 'NO_DATA',
  UNSUBMITTED = 'UNSUBMITTED',
  SUBMITTED = 'SUBMITTED'
}

export const AttachmentTypeFileExtensions = {
  AUDIO: ['.wav', '.mp3', '.mp4', '.wma'],
  DATA: ['.txt', '.xls', '.xlsx', '.xlsm', '.xlsb', '.accdb', '.mdb', '.ods', '.csv'],
  IMAGE: ['.gif', '.png', '.jpg', '.jpeg', '.svg', '.tiff', '.bmp', '.tif'],
  /**
   * Telelemetry device key file extensions for Vectronic devices.
   */
  KEYX: ['.keyx', '.zip'],
  /**
   * Telelemetry device key file extensions for Lotek devices.
   */
  CFG: ['.cfg', '.zip'],
  /**
   * Report file extensions.
   */
  REPORT: ['.doc', '.docx', '.pdf'],
  SPATIAL: ['.kml', '.gpx', '.zip'],
  VIDEO: ['.mp4', '.mov', '.wmv', '.ave'],
  OTHER: [
    '.wav',
    '.mp3',
    '.mp4',
    '.wma',
    '.txt',
    '.xls',
    '.xlsx',
    '.xlsm',
    '.xlsb',
    '.accdb',
    '.mdb',
    '.ods',
    '.csv',
    '.gif',
    '.png',
    '.jpg',
    '.jpeg',
    '.svg',
    '.tiff',
    '.bmp',
    '.tif',
    '.doc',
    '.docx',
    '.kml',
    '.gdb',
    '.lyr',
    '.shp',
    '.las',
    '.laz',
    '.zlas',
    '.gml',
    '.gpx',
    '.json',
    '.mp4',
    '.mov',
    '.wmv',
    '.ave'
  ]
};
