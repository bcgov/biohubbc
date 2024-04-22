#! /usr/bin/env node

const fs = require("fs");
const util = require("util");
const fsPromises = require("fs").promises;
const exec = util.promisify(require("child_process").exec);

/**
 * Static config for SQL formatting.
 * Potentially could move this into an .env file, but maybe overkill for this script.
 *
 */
const CONFIG = {
  first_name: "Macgregor",
  last_name: "Aubertin-Young",
  email: "Macgregor.Aubertin-Young@gov.bc.ca",
  project_role: "Coordinator",
  project_program: "Wildlife",
  survey_status: "Completed",
  survey_type: "Monitoring",
  survey_intended_outcome_1: "Mortality",
  survey_intended_outcome_2: "Distribution or Range Map",
  caribou_tsn: 180701,
};

const BCGW_CARIBOU_ENDPOINT =
  "https://openmaps.gov.bc.ca/geo/pub/wfs?request=GetFeature&service=WFS&version=2.0.0&typeNames=WHSE_WILDLIFE_INVENTORY.GCPB_CARIBOU_POPULATION_SP&outputFormat=json&srsName=EPSG:4326";

const CARIBOU_FEATURES_FILE = "files/features.json";

/**
 * Wrapper for exec util, grants ability to call bin commands from js script.
 *
 * @async
 * @param {string} command - Command to execute. ie: `jq < ${fileName}` | `echo 'Hello World'`
 * @throws {error} - stderr - Error from command.
 * @returns {Promise<string>} Standard output as string.
 */
const execute = async (command) => {
  const { stdout, stderr } = await exec(`${command}`);
  if (stderr) {
    // This is the error message from the external command.
    throw stderr;
  }
  return stdout;
};

/**
 * Pre-parse input file with jq and output as JSON object.
 *
 * Steps:
 *  1. Group by critter_id.
 *  2. Group by herd (unit_name).
 *  3. Find start/end dates and format year property.
 *  4. Group surveys by matching herd and year.
 *  5. Associate deployments to each applicable survey.
 *
 * @async
 * @param {string} fileName - Filename passed in via argument.
 * @returns {Promise<object>} JQ parsed file as object.
 */
const jqPreParseInputFile = async (fileName) => {
  const data = await execute(
    `
    jq '[group_by(.critter_id)[]|add] | group_by(.unit_name) | .[] |=
      {
        herd: .[].unit_name,
        start_date: min_by(.attachment_start) | .attachment_start,
        end_date: max_by(.attachment_start) | .attachment_start,
        surveys: (group_by(.attachment_start | .[:4]) | .[] |=
          {
            year: (.[].attachment_start | .[:4]),
            deployments: (.[] |=
              {
                deployment_id: .deployment_id,
                critter_id: .critter_id,
                attachment_start: .attachment_start,
              })
          })
      }' < ${fileName}
    `,
  );

  return JSON.parse(data);
};

/**
 * Fetch Caribou features (geojson geometries) and write to file.
 *
 * Note: Jq is unable to accept "large" json objects as arguments.
 * So output the geometries to a file then use jq again to parse from the file.
 *
 * @async
 * @returns {Promise<void>}
 */
const writeCaribouHerdFeaturesToFile = async () => {
  const res = await fetch(BCGW_CARIBOU_ENDPOINT);
  await fsPromises.writeFile(CARIBOU_FEATURES_FILE, await res.text());
};

/**
 * Get specific herd GeoJson from features.json file.
 *
 * @async
 * @param {string} herd - Caribou herd region. ie: `Atlin`.
 * @returns {Promise<string>} GeoJson feature as string.
 */
const getCaribouHerdGeoJson = async (herd) => {
  const data = await execute(
    `jq -c '.features[] | select(.properties.HERD_NAME == "${herd}")' < ${CARIBOU_FEATURES_FILE}`,
  );

  return data;
};

/**
 * Generate SIMS SQL for existing Caribou deployments in BCTW.
 *
 * Steps:
 *  1. Validate file name is passed as arugment to script.
 *  2. If features.json file does not exist, fetch geometries and write to file.
 *  3. Pre-parse input file with jq.
 *  4. Loop through each item in JSON array and generate project meta SQL.
 *  5. For each project generate surveys meta SQL and inject Caribou herd geometries.
 *  6. For each survey generate critter and deployment SQL.
 *  7. Wrap SQL in transaction block.
 *
 * @async
 * @returns {Promise<string>} SIMS SQL.
 */
async function main() {
  const file_name_argument = process.argv[2];

  try {
    if (!file_name_argument) {
      throw `Error: Missing file name argument -> ./main.js {input-filename}.json > deployments.sql`;
    }

    //If features.json file already exists skip.
    if (!fs.existsSync(CARIBOU_FEATURES_FILE)) {
      await writeCaribouHerdFeaturesToFile();
    }

    const data = await jqPreParseInputFile(file_name_argument);

    let sql = "";

    for (const project of data) {
      sql += `WITH p AS (INSERT INTO project (name, objectives, coordinator_first_name, coordinator_last_name, coordinator_email_address, start_date, end_date) VALUES ($$Caribou - ${project.herd} - BCTW Telemetry$$, $$BCTW telemetry deployments for ${project.herd} Caribou$$, $$${CONFIG.first_name}$$, $$${CONFIG.last_name}$$, $$${CONFIG.email}$$, $$${project.start_date}$$, $$${project.end_date}$$) RETURNING project_id
      ), ppp AS (INSERT INTO project_participation (project_id, system_user_id, project_role_id) SELECT project_id, (select system_user_id from system_user where user_identifier = $$mauberti$$), (select project_role_id from project_role where name = $$${CONFIG.project_role}$$) FROM p
      ), pp AS (INSERT INTO project_program (project_id, program_id) SELECT project_id, (select program_id from program where name = $$${CONFIG.project_program}$$) FROM p
    `;
      for (let sIndex = 0; sIndex < project.surveys.length; sIndex++) {
        const survey = project.surveys[sIndex];

        const feature = await getCaribouHerdGeoJson(project.herd);
        const geometry = JSON.stringify(JSON.parse(feature).geometry);

        if (!feature) {
          // Safeguard incase a Caribou has a herd that does not match the BCGW herds.
          throw `Error: Missing herd geometry for: ${project.herd}`;
        }

        sql += `), s${sIndex} AS (INSERT INTO survey (project_id, name, lead_first_name, lead_last_name, start_date, end_date, progress_id) SELECT project_id, $$Caribou - ${survey.year} - ${project.herd} - BCTW Telemetry$$, $$${CONFIG.first_name}$$, $$${CONFIG.last_name}$$, $$${project.start_date}$$, $$${project.end_date}$$, (select survey_progress_id from survey_progress where name = $$${CONFIG.survey_status}$$) FROM p RETURNING survey_id
          ), st${sIndex} AS (INSERT INTO survey_type (survey_id, type_id) SELECT survey_id, (select type_id from type where name = $$${CONFIG.survey_type}$$) FROM s${sIndex}
          ), ss${sIndex} AS (INSERT INTO study_species (survey_id, is_focal, itis_tsn) SELECT survey_id, true, ${CONFIG.caribou_tsn} FROM s${sIndex}
          ), sio1${sIndex} AS (INSERT INTO survey_intended_outcome (survey_id, intended_outcome_id) SELECT survey_id, (select intended_outcome_id from intended_outcome where name = $$${CONFIG.survey_intended_outcome_1}$$) FROM s${sIndex}
          ), sio2${sIndex} AS (INSERT INTO survey_intended_outcome (survey_id, intended_outcome_id) SELECT survey_id, (select intended_outcome_id from intended_outcome where name = $$${CONFIG.survey_intended_outcome_2}$$) FROM s${sIndex}
          ), sl${sIndex} AS (INSERT INTO survey_location (survey_id, name, description, geojson, geography) SELECT survey_id, $$${project.herd}$$, $$${project.herd} herd region boundary$$, $$[${feature}]$$, public.geography(public.ST_GeomFromGeoJSON($$${geometry}$$)) FROM s${sIndex}
      `;
        for (let dIndex = 0; dIndex < survey.deployments.length; dIndex++) {
          const deployment = survey.deployments[dIndex];
          if (sIndex == project.surveys.length - 1) {
            sql += `), survey${sIndex}critter${dIndex} AS (INSERT INTO critter (survey_id, critterbase_critter_id) SELECT survey_id, $$${deployment.critter_id}$$ FROM s${sIndex} RETURNING critter_id
          ) INSERT INTO deployment (critter_id, bctw_deployment_id) SELECT critter_id, $$${deployment.deployment_id}$$ FROM survey${sIndex}critter${dIndex};\n\n`;
          } else {
            sql += `), survey${sIndex}critter${dIndex} AS (INSERT INTO critter (survey_id, critterbase_critter_id) SELECT survey_id, $$${deployment.critter_id}$$ FROM s${sIndex} RETURNING critter_id
          ), survey${sIndex}deployment${dIndex} AS (INSERT INTO deployment (critter_id, bctw_deployment_id) SELECT critter_id, $$${deployment.deployment_id}$$ FROM survey${sIndex}critter${dIndex}`;
          }
        }
      }
    }

    console.log(`${sql}`);
  } catch (err) {
    console.error(err);
  }
}

main();
