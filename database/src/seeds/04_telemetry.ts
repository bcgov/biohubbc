import { faker } from '@faker-js/faker';
import { Knex } from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;
const DB_SCHEMA_DAPI_V1 = process.env.DB_SCHEMA_DAPI_V1;

const TELEMETRY_START_DATE = '2024-01-01';
const TELEMETRY_END_DATE = '2025-01-01';
const DEPLOYMENT_START_DATE = '2024-06-01'; // 6 months before telemetry start date
const DEPLOYMENT_END_DATE = TELEMETRY_END_DATE; // Same as telemetry end date
const INSERT_BATCH_SIZE = 100;
const NUM_TELEMETRY_POINTS = {
  MANUAL: 50,
  LOTEK: 100,
  VECTRONIC: 50,
  ATS: 10,
  EXTRA: 100
};
const LOTEK_DEVICE = {
  make: 'lotek',
  model: 'SRX-800',
  serial: '1111'
};
const VECTRONIC_DEVICE = {
  make: 'vectronic',
  model: 'GPS-GSM-Tracker',
  serial: '2222'
};
const ATS_DEVICE = {
  make: 'ats',
  model: 'iPC',
  serial: '3333'
};
const DEVICES = [LOTEK_DEVICE, VECTRONIC_DEVICE, ATS_DEVICE];

/**
 * Add telemetry and telemetry metadata to the database.
 *
 * Notes:
 *  - Each survey will have 3 devices, one of each make
 *  - Each device will have a deployment with associated telemetry
 *  - Each device will have telemetry data ie: vendor and manual
 *  - Seed device serials are generated using the survey ID and device serial ie: 12222 for survey 1 and device 2222
 *  - Additional device serials are generated between 70000 and 80000 ie: 72800
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function seed(knex: Knex): Promise<void> {
  await knex.raw(`
    SET SCHEMA '${DB_SCHEMA}';
    SET SEARCH_PATH=${DB_SCHEMA},${DB_SCHEMA_DAPI_V1};
  `);

  const device = await knex.select('*').from('device').limit(1);

  // If devices already exist, do not seed telemetry
  if (device.length) {
    return;
  }

  const generateVectronicID = generateID();
  const surveys = await knex.select('*').from('survey');

  for (const survey of surveys) {
    const surveyId = survey.survey_id;
    /**
     * Each survey will have 3 devices, one of each make
     */
    for (const device of DEVICES) {
      /**
       *
       * INSERT DEVICE/CRITTER/DEPLOYMENT METADATA
       *
       */
      const rawDevice = await knex.raw(insertDevice(surveyId, device));
      const rawCritter = await knex.raw(insertCritter(surveyId));

      const critterId = rawCritter.rows[0].critter_id;
      const deviceId = rawDevice.rows[0].device_id;
      const deviceSerial = rawDevice.rows[0].serial;

      const rawDeployment = await knex.raw(insertDeployment(surveyId, critterId, deviceId));
      const deploymentId = rawDeployment.rows[0].deployment_id;

      // MANUAL TELEMETRY
      const manualTelemetry = getManualTelemetry(deploymentId, NUM_TELEMETRY_POINTS.MANUAL);
      await knex.insert(manualTelemetry).into('telemetry_manual');

      // LOTEK TELEMETRY
      if (device.make === LOTEK_DEVICE.make) {
        let telemetry = getLotekTelemetry(deviceSerial, NUM_TELEMETRY_POINTS.LOTEK);

        // Generate additional filler telemetry
        for (let i = 0; i < 5; i++) {
          const fakeSerial = faker.number.int({ min: 70000, max: 80000 });
          telemetry = telemetry.concat(getLotekTelemetry(fakeSerial, NUM_TELEMETRY_POINTS.EXTRA));
        }

        await knex.batchInsert('telemetry_lotek', telemetry, INSERT_BATCH_SIZE);
      }

      // VECTRONIC TELEMETRY
      if (device.make === VECTRONIC_DEVICE.make) {
        let telemetry = getVectronicTelemetry(deviceSerial, NUM_TELEMETRY_POINTS.VECTRONIC, generateVectronicID);

        // Generate additional filler telemetry
        for (let i = 0; i < 5; i++) {
          const fakeSerial = faker.number.int({ min: 70000, max: 80000 });
          telemetry = telemetry.concat(
            getVectronicTelemetry(fakeSerial, NUM_TELEMETRY_POINTS.EXTRA, generateVectronicID)
          );
        }

        await knex.batchInsert('telemetry_vectronic', telemetry, INSERT_BATCH_SIZE);
      }

      // ATS TELEMETRY
      if (device.make === ATS_DEVICE.make) {
        let telemetry = getAtsTelemetry(deviceSerial, NUM_TELEMETRY_POINTS.ATS);

        // Generate additional filler telemetry
        for (let i = 0; i < 5; i++) {
          const fakeSerial = faker.number.int({ min: 70000, max: 80000 });
          telemetry = telemetry.concat(getAtsTelemetry(fakeSerial, NUM_TELEMETRY_POINTS.EXTRA));
        }

        await knex.batchInsert('telemetry_ats', telemetry, INSERT_BATCH_SIZE);
      }
    }
  }
}

/**
 * Generator function to create unique ID's.
 *
 * Actual generator usecase?
 * Generates collision free vectronic vendor ID's (idposition).
 *
 */
function* generateID() {
  let id = 0;
  while (true) {
    yield id++;
  }
}

const getSurveyDeviceSerial = (surveyId: number, serial: string) => `${surveyId}${serial}`;

/**
 * SQL to insert a critter row.
 *
 */
const insertCritter = (surveyId: number) => `
  INSERT INTO critter (
    survey_id,
    critterbase_critter_id
  )
  VALUES (
    ${surveyId},
    $$${faker.string.uuid()}$$ -- TODO: replace with actual critterbase critterID from critterbase seed
  )
  RETURNING critter_id;
`;

/**
 * SQL to insert a device row.
 *
 */
const insertDevice = (surveyId: number, device: { make: string; model: string; serial: string }) => `
  INSERT INTO device (
    survey_id,
    serial,
    device_make_id,
    model
  )
  VALUES (
    ${surveyId},
    $$${getSurveyDeviceSerial(surveyId, device.serial)}$$,
    (SELECT device_make_id FROM device_make WHERE name = '${device.make}'),
    $$${device.model}$$
  )
  RETURNING device_id, serial;
`;

/**
 * SQL to insert a deployment row.
 *
 */
const insertDeployment = (surveyId: number, critterId: number, deviceId: number) => `
  INSERT INTO deployment (
    survey_id,
    critter_id,
    device_id,
    attachment_start_date,
    attachment_end_date
  )
  VALUES (
    ${surveyId},
    ${critterId},
    ${deviceId},
    $$${DEPLOYMENT_START_DATE}$$,
    $$${DEPLOYMENT_END_DATE}$$
  )
  RETURNING deployment_id;
`;

/**
 * Get manual telemetry data for insert.
 *
 */
const getManualTelemetry = (deploymentId: number, numRecords: number) => {
  const telemetry = [];

  for (let i = 0; i < numRecords; i++) {
    const telemetryDate = faker.date.between({ from: TELEMETRY_START_DATE, to: TELEMETRY_END_DATE });

    telemetry.push({
      deployment_id: deploymentId,
      latitude: faker.location.latitude(),
      longitude: faker.location.longitude(),
      acquisition_date: telemetryDate,
      transmission_date: telemetryDate
    });
  }

  return telemetry;
};

/**
 * Get telemetry data for Lotek devices.
 *
 */
const getLotekTelemetry = (deviceSerial: number, numRecords: number) => {
  const telemetry = [];

  for (let i = 0; i < numRecords; i++) {
    const telemetryDate = faker.date.between({ from: TELEMETRY_START_DATE, to: TELEMETRY_END_DATE });
    const latitude = faker.location.latitude({ min: 48, max: 60 });
    const longitude = faker.location.longitude({ min: -139, max: -114 });

    telemetry.push({
      deviceid: deviceSerial,
      channelstatus: faker.hacker.adjective(),
      uploadtimestamp: telemetryDate,
      latitude: latitude,
      longitude: longitude,
      altitude: faker.number.int({ min: 0, max: 1000 }),
      ecefx: faker.number.float({ min: 0, max: 10 }),
      ecefy: faker.number.float({ min: 0, max: 10 }),
      ecefz: faker.number.float({ min: 0, max: 10 }),
      rxstatus: faker.number.int({ min: 0, max: 1 }),
      temperature: faker.number.float({ min: -20, max: 40 }),
      fixduration: faker.number.int({ min: 0, max: 100 }),
      bhastempvoltage: false,
      devname: faker.person.firstName(),
      deltatime: null,
      fixtype: faker.number.int({ min: 0, max: 3 }),
      cepradius: faker.number.float({ min: 0, max: 10 }),
      crc: null,
      recdatetime: telemetryDate
    });
  }

  return telemetry;
};

/**
 * Get telemetry data for Vectronic devices.
 *
 */
const getVectronicTelemetry = (deviceSerial: number, numRecords: number, generateID: Generator) => {
  const telemetry = [];

  for (let i = 0; i < numRecords; i++) {
    const telemetryDate = faker.date.between({ from: TELEMETRY_START_DATE, to: TELEMETRY_END_DATE });
    const latitude = faker.location.latitude({ min: 48, max: 60 });
    const longitude = faker.location.longitude({ min: -139, max: -114 });

    telemetry.push({
      idcollar: deviceSerial,
      idposition: generateID.next().value,
      acquisitiontime: telemetryDate,
      scts: telemetryDate,
      origincode: 'G',
      ecefx: faker.number.float({ min: 0, max: 10 }),
      ecefy: faker.number.float({ min: 0, max: 10 }),
      ecefz: faker.number.float({ min: 0, max: 10 }),
      latitude: latitude,
      longitude: longitude,
      height: faker.number.int({ min: 0, max: 1000 }),
      dop: faker.number.float({ min: 0, max: 10 }),
      idfixtype: 10,
      positionerror: faker.number.float({ min: 0, max: 10 }),
      satcount: faker.number.int({ min: 0, max: 10 }),
      // skipping all cannels ie: ch01satid, ch02satid...
      idmortalitystatus: faker.number.int({ min: 0, max: 1 }),
      activity: faker.number.int({ min: 0, max: 1 }),
      mainvoltage: faker.number.float({ min: 0, max: 10 }),
      backupvoltage: faker.number.float({ min: 0, max: 10 }),
      temperature: faker.number.float({ min: -20, max: 40 }),
      transformedx: faker.number.float({ min: 0, max: 10 }),
      transformedy: faker.number.float({ min: 0, max: 10 })
    });
  }

  return telemetry;
};

/**
 * Get telemetry data for ATS devices.
 *
 */
const getAtsTelemetry = (deviceSerial: number, numRecords: number) => {
  const telemetry = [];

  for (let i = 0; i < numRecords; i++) {
    const telemetryDate = faker.date.between({ from: TELEMETRY_START_DATE, to: TELEMETRY_END_DATE });
    const latitude = faker.location.latitude({ min: 48, max: 60 });
    const longitude = faker.location.longitude({ min: -139, max: -114 });

    telemetry.push({
      collarserialnumber: deviceSerial,
      date: telemetryDate,
      numberfixes: faker.number.int({ min: 0, max: 100 }),
      battvoltage: faker.number.float({ min: 0, max: 10 }),
      mortality: false,
      breakoff: false,
      gpsontime: faker.number.int({ min: 0, max: 100 }),
      satontime: faker.number.int({ min: 0, max: 100 }),
      saterrors: faker.number.int({ min: 0, max: 100 }),
      gmtoffset: faker.number.int({ min: 0, max: 100 }),
      lowbatt: false,
      event: faker.hacker.verb(),
      latitude: latitude,
      longitude: longitude,
      cepradius_km: faker.number.int({ min: 0, max: 10 }),
      temperature: String(faker.number.float({ min: -20, max: 40 })), // TODO: Invesitgate why temperature is a string?
      hdop: faker.string.alpha({ length: { min: 0, max: 10 } }),
      numsats: faker.number.int({ min: 0, max: 10 }),
      fixtime: faker.string.numeric({ length: { min: 0, max: 10 } }),
      activity: faker.string.alpha({ length: { min: 0, max: 10 } })
    });
  }

  return telemetry;
};
