import { Knex } from 'knex';

/**
 * Rename `funding_source` table and similarly named columns to `agency`.
 * Update dependent table `investment_action_category`.
 *
 * Add additional values to agency table. Specifically, include the values from the static coordinator agencies list.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    -------------------------------------------------------------------------
    -- Drop existing views
    -------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    -- Drop view for funding_source table
    DROP VIEW IF EXISTS funding_source;
    DROP VIEW IF EXISTS investment_action_category;

    -------------------------------------------------------------------------
    -- Drop existing indexes/constraints
    -------------------------------------------------------------------------
	  SET SEARCH_PATH=biohub;

    -- Drop investment_action_category table constraints/indexes
    ALTER TABLE investment_action_category DROP CONSTRAINT "Reffunding_source136";
    DROP INDEX "Ref73136";

    
    -- Drop funding_source table constraints/indexes
    ALTER TABLE funding_source DROP CONSTRAINT funding_source_pk;
    DROP INDEX funding_source_nuk1;

    -------------------------------------------------------------------------
    -- Update/alter tables, comments, indexes, constraints, triggers, etc
    -------------------------------------------------------------------------
    -- Update funding_source table name
    ALTER TABLE funding_source RENAME TO agency;
    COMMENT ON TABLE agency IS 'A list of agencies.';

    -- Update/add agency primary key constraint
    ALTER TABLE agency RENAME COLUMN funding_source_id TO agency_id;
    ALTER TABLE agency ADD CONSTRAINT agency_pk PRIMARY KEY (agency_id);

    -- Add agency unique end-date index
    CREATE UNIQUE INDEX agency_nuk1 ON agency(name, (record_end_date is NULL)) where record_end_date is null;

    -- Update sequence
    ALTER SEQUENCE funding_source_funding_source_id_seq RENAME TO agency_agency_id_seq;

    -- Update agency audit and journal trigger names
    ALTER TRIGGER audit_funding_source ON agency RENAME TO audit_agency;
    ALTER TRIGGER journal_funding_source ON agency RENAME TO journal_agency;


    -- Update investment_action_category table funding_source_id column name
    ALTER TABLE investment_action_category RENAME COLUMN funding_source_id TO agency_id;

    -- Add investment_action_category foreign key constraint
    ALTER TABLE investment_action_category ADD CONSTRAINT "investment_action_category_fk1" 
      FOREIGN KEY (agency_id) REFERENCES agency(agency_id);

    -- Add investment_action_category index
    CREATE INDEX "investment_action_category_idx1" ON investment_action_category(agency_id);

    -------------------------------------------------------------------------
    -- Add new values to agency and investment_action_category tables
    -------------------------------------------------------------------------

    ${insertNewAgencyRows}
    ${insertInvestmentActionCategoryRowsForNewAgencyRows}

    -------------------------------------------------------------------------
    -- Create views
    -------------------------------------------------------------------------
    SET SEARCH_PATH=biohub_dapi_v1;

    -- Create view for new agency table
    CREATE OR REPLACE VIEW agency AS SELECT * FROM biohub.agency;
    CREATE OR REPLACE VIEW investment_action_category AS SELECT * FROM biohub.investment_action_category;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}

const insertNewAgencyRows = `
  INSERT INTO agency
    (name, record_effective_date, project_id_optional)
  VALUES
    ('A Rocha Canada', NOW(), TRUE),
    ('Aarde Environmental Ltd.', NOW(), TRUE),
    ('Acres Consulting', NOW(), TRUE),
    ('Advisian', NOW(), TRUE),
    ('AECOM Canada Ltd.', NOW(), TRUE),
    ('Alaska Department of Fish and Game', NOW(), TRUE),
    ('Alces Environmental Ltd.', NOW(), TRUE),
    ('Allnorth Consultants Limited', NOW(), TRUE),
    ('Allouette River Management Society', NOW(), TRUE),
    ('AMEC Earth and Environmental', NOW(), TRUE),
    ('Applied Aquatic Research Ltd.', NOW(), TRUE),
    ('Applied Ecological Solutions Corp.', NOW(), TRUE),
    ('Aquaparian Environmental Consulting Ltd.', NOW(), TRUE),
    ('AquaSilva Resource Management Ltd.', NOW(), TRUE),
    ('Aqua-Tex Scientific Consulting Ltd. ', NOW(), TRUE),
    ('Associated Environmental Consultants Inc.', NOW(), TRUE),
    ('Association of Wetland Stewards for Clayoquot and Barkley Sounds', NOW(), TRUE),
    ('Assuage Environmental Ltd.', NOW(), TRUE),
    ('Aurico Metals Inc.', NOW(), TRUE),
    ('Avison Management Services Ltd.', NOW(), TRUE),
    ('Azimuth Consulting Group Partnership', NOW(), TRUE),
    ('Balanced Ecological Management Company', NOW(), TRUE),
    ('Bamfield Marine Sciences Centre', NOW(), TRUE),
    ('BBA Engineering Ltd.', NOW(), TRUE),
    ('BC Conservation Foundation (BCCF)', NOW(), TRUE),
    ('BCIT Fish Wildlife and Recreation Program', NOW(), TRUE),
    ('Burt and Associates', NOW(), TRUE),
    ('Canadian Forest Products', NOW(), TRUE),
    ('Capital Regional District (CRD)', NOW(), TRUE),
    ('Cariboo Environmental Quality Consulting Ltd.', NOW(), TRUE),
    ('Cariboo Envirotech Ltd.', NOW(), TRUE),
    ('Carleton University', NOW(), TRUE),
    ('Cascade Environmental Resource Group Ltd.', NOW(), TRUE),
    ('Castus Environmental Services Ltd.', NOW(), TRUE),
    ('Central Westcoast Forest Society', NOW(), TRUE),
    ('Chu Cho Environmental', NOW(), TRUE),
    ('City of Abbotsford', NOW(), TRUE),
    ('City of Chilliwack', NOW(), TRUE),
    ('City of Coquitlam', NOW(), TRUE),
    ('City of Kelowna Environment Division', NOW(), TRUE),
    ('Clark University', NOW(), TRUE),
    ('Clearwater Environmental Consulting', NOW(), TRUE),
    ('Coast River Environmental Services Ltd.', NOW(), TRUE),
    ('Coldstream Ecology Ltd.', NOW(), TRUE),
    ('College of New Caledonia', NOW(), TRUE),
    ('Columbia Environmental Consulting Ltd.', NOW(), TRUE),
    ('Columbia Power Corporation', NOW(), TRUE),
    ('Colville Confederated Tribes Fish and Wildlife', NOW(), TRUE),
    ('Comox Valley Project Watershed Society', NOW(), TRUE),
    ('Cooper Beauchesne and Associates Ltd.', NOW(), TRUE),
    ('Copcan Contracting Ltd.', NOW(), TRUE),
    ('Cornice Environmental Consulting Ltd.', NOW(), TRUE),
    ('Corvidae Environmental Consulting Inc.', NOW(), TRUE),
    ('Crane Creek Enterprises', NOW(), TRUE),
    ('CSR Environmental Ltd.', NOW(), TRUE),
    ('Current Environmental Ltd.', NOW(), TRUE),
    ('D. Burt and Associates', NOW(), TRUE),
    ('D.R. Clough Consulting', NOW(), TRUE),
    ('David Bustard and Associates Ltd.', NOW(), TRUE),
    ('Davis Environmental Ltd.', NOW(), TRUE),
    ('Dayesi Services', NOW(), TRUE),
    ('Department of Fisheries and Oceans (DFO)', NOW(), TRUE),
    ('DGR Consulting', NOW(), TRUE),
    ('Dillon Consulting Limited', NOW(), TRUE),
    ('District of Kent', NOW(), TRUE),
    ('District of North Vancouver', NOW(), TRUE),
    ('District of Saanich', NOW(), TRUE),
    ('Diversified Environmental Services Ltd.', NOW(), TRUE),
    ('DWB Consulting Services Ltd.', NOW(), TRUE),
    ('East Carolina University - Department of Biology', NOW(), TRUE),
    ('EBB Environmental Consulting Inc.', NOW(), TRUE),
    ('Ecofish Research Ltd.', NOW(), TRUE),
    ('Ecofor Consulting', NOW(), TRUE),
    ('Ecologic Consulting Ltd.', NOW(), TRUE),
    ('EcoMetrix Incorporated', NOW(), TRUE),
    ('Ecora Engineering and Resource Group Ltd.', NOW(), TRUE),
    ('Ecoscape Environmental Consultants Ltd.', NOW(), TRUE),
    ('Eco-Web Ecological Consulting Ltd.', NOW(), TRUE),
    ('EDI Environmental Dynamics Inc.', NOW(), TRUE),
    ('Elevate Environmental Inc.', NOW(), TRUE),
    ('Elk River Alliance', NOW(), TRUE),
    ('ENKON Environmental Ltd.', NOW(), TRUE),
    ('Envirologic Consulting Inc.', NOW(), TRUE),
    ('Environment and Climate Change Canada', NOW(), TRUE),
    ('Envirowest Consultants Inc.', NOW(), TRUE),
    ('ERM Consultants Canada Ltd.', NOW(), TRUE),
    ('Esther Guimond Consulting', NOW(), TRUE),
    ('Estsek Environmental Services LLP', NOW(), TRUE),
    ('EXP Services Inc.', NOW(), TRUE),
    ('FINS Consulting Ltd.', NOW(), TRUE),
    ('Fish-Kissing Weasels Environmental', NOW(), TRUE),
    ('ForFish Consulting', NOW(), TRUE),
    ('Forsite Consultants Ltd.', NOW(), TRUE),
    ('FortisBC', NOW(), TRUE),
    ('Fraser Valley Watersheds Coalition', NOW(), TRUE),
    ('FSCI Biological Concultants', NOW(), TRUE),
    ('G3 Consulting Ltd.', NOW(), TRUE),
    ('GeoMarine Environmental Consultants Ltd.', NOW(), TRUE),
    ('GG Oliver and Associates Environmental Science', NOW(), TRUE),
    ('Gitanyow Fisheries Authority', NOW(), TRUE),
    ('Gitksan Watershed Authorities', NOW(), TRUE),
    ('Golder Associates Ltd.', NOW(), TRUE),
    ('Grassroots Environmental Services', NOW(), TRUE),
    ('Hatfield Consulting Ltd.', NOW(), TRUE),
    ('HCR Environmental Consulting', NOW(), TRUE),
    ('Hemmera', NOW(), TRUE),
    ('High Country Consulting', NOW(), TRUE),
    ('Hill Environmental Ltd.', NOW(), TRUE),
    ('Hocquard Consulting', NOW(), TRUE),
    ('I.C. Ramsay and Associates', NOW(), TRUE),
    ('Ingersol Mountain Enterprise Ltd.', NOW(), TRUE),
    ('Inland Timber Management Ltd.', NOW(), TRUE),
    ('InStream Fisheries Research Inc.', NOW(), TRUE),
    ('Interior Reforestation Co. Ltd.', NOW(), TRUE),
    ('IRC Integrated Resource Consultants Inc.', NOW(), TRUE),
    ('ISL Engineering and Land Services Ltd.', NOW(), TRUE),
    ('Iverson & MacKenzie Biological Consulting Ltd.', NOW(), TRUE),
    ('Jacobs Canada Inc.', NOW(), TRUE),
    ('JBL Environmental Services Ltd.', NOW(), TRUE),
    ('Karen L Grainger', NOW(), TRUE),
    ('Kawa Enginnering Ltd.', NOW(), TRUE),
    ('Kerr Wood Leidal Associates Ltd.', NOW(), TRUE),
    ('Keystone Environmental Ltd.', NOW(), TRUE),
    ('Klohn Crippen Berger Ltd.', NOW(), TRUE),
    ('Knight Piesold Ltd.', NOW(), TRUE),
    ('Ktunaxa Nation Council', NOW(), TRUE),
    ('Lake Trail Environmental Consulting', NOW(), TRUE),
    ('Letts Environmental Consultants Ltd.', NOW(), TRUE),
    ('LGL Limited', NOW(), TRUE),
    ('Lheidli T Enneh First Nations', NOW(), TRUE),
    ('Limnotek Research and Development Inc.', NOW(), TRUE),
    ('Living Resources Environmental', NOW(), TRUE),
    ('Lorax Environmental Services Ltd.', NOW(), TRUE),
    ('Lotic Environmental Ltd.', NOW(), TRUE),
    ('M.C. Wright and Associates Ltd.', NOW(), TRUE),
    ('Madrone Environmental Services Ltd.', NOW(), TRUE),
    ('Mainstream Aquatics Ltd.', NOW(), TRUE),
    ('Mainstream Biological Consulting Inc.', NOW(), TRUE),
    ('Marine Harvest Canada', NOW(), TRUE),
    ('Marlim Ecological Consulting Ltd.', NOW(), TRUE),
    ('Masse Environmental Consultants Ltd.', NOW(), TRUE),
    ('Matrix Solutions Inc.', NOW(), TRUE),
    ('Max Planck Institute, Ploen, Germany', NOW(), TRUE),
    ('McCleary Aquatic Systems Consulting', NOW(), TRUE),
    ('McElhanney Ltd.', NOW(), TRUE),
    ('McGill University, Redpath Museum', NOW(), TRUE),
    ('McTavish Resource & Management Consultants Ltd.', NOW(), TRUE),
    ('Metro Vancouver (GVRD)', NOW(), TRUE),
    ('Metro Vancouver Regional Parks', NOW(), TRUE),
    ('Michigan State University', NOW(), TRUE),
    ('Mid Vancouver Island Habitat Enhancement Society', NOW(), TRUE),
    ('Ministry of Environment & Climate Change Strategy', NOW(), TRUE),
    ('Ministry of Forests', NOW(), TRUE),
    ('Ministry of Forests, Lands, Natural Resource Operations & Rural Development', NOW(), TRUE),
    ('Ministry of Lands, Water, and Resource Stewardship', NOW(), TRUE),
    ('Ministry of Transportation & Infrastructure', NOW(), TRUE),
    ('Minnow Environmental Inc.', NOW(), TRUE),
    ('Montana Fish, Wildlife & Parks', NOW(), TRUE),
    ('Mount Polley Mining Corporation', NOW(), TRUE),
    ('Mountain Water Research', NOW(), TRUE),
    ('Naito Environmental', NOW(), TRUE),
    ('Natural Resources Training Group (NRTG)', NOW(), TRUE),
    ('Nautilus Environmental Company Ltd.', NOW(), TRUE),
    ('Nicola Valley Institute of Technology (NVIT)', NOW(), TRUE),
    ('North Coast Skeena First Nations Stewardship Society', NOW(), TRUE),
    ('North River Consulting Ltd.', NOW(), TRUE),
    ('Northern (Arctic) Federal University (NArFU)', NOW(), TRUE),
    ('Northern Van Island Salmonid Enhancement Assoc.', NOW(), TRUE),
    ('Northland Environmental Ltd.', NOW(), TRUE),
    ('Northwest Community College', NOW(), TRUE),
    ('Nova Pacific Environmental Ltd.', NOW(), TRUE),
    ('Nupqu Development Corporation', NOW(), TRUE),
    ('Ogopogo Environmental & Engineering Consultants Ltd.', NOW(), TRUE),
    ('Okanagan Nation Alliance', NOW(), TRUE),
    ('Pacificus Biological Services Ltd.', NOW(), TRUE),
    ('Palmer Environmental Consulting Group Inc.', NOW(), TRUE),
    ('Pearson Ecological', NOW(), TRUE),
    ('Peninsula Streams Society', NOW(), TRUE),
    ('Phoenix Environmental Services Ltd.', NOW(), TRUE),
    ('Pinchin Ltd.', NOW(), TRUE),
    ('Poisson Consulting Ltd.', NOW(), TRUE),
    ('Polaris Environmental Consultants Ltd.', NOW(), TRUE),
    ('Pottinger Gaherty Environmental Consultants Ltd.', NOW(), TRUE),
    ('Profor Resource Development Inc.', NOW(), TRUE),
    ('Qqs Projects Society', NOW(), TRUE),
    ('Quatse River Hatchery', NOW(), TRUE),
    ('Quesnel River Environmental Restoration Services', NOW(), TRUE),
    ('Red Chris Development Company Ltd.', NOW(), TRUE),
    ('Redcedar Environmental Consulting Inc.', NOW(), TRUE),
    ('Resort Municipality of Whistler', NOW(), TRUE),
    ('Roy Northern Environmental Ltd.', NOW(), TRUE),
    ('Sage Environmental Consulting Ltd.', NOW(), TRUE),
    ('Salmon Coast Field Station Society', NOW(), TRUE),
    ('Sartori Environmental Services Inc.', NOW(), TRUE),
    ('School District 54', NOW(), TRUE),
    ('Secwepemc Fisheries Commission', NOW(), TRUE),
    ('Selkirk College', NOW(), TRUE),
    ('SER Environmental Management', NOW(), TRUE),
    ('Seven Generations Environmental Services Ltd.', NOW(), TRUE),
    ('Shawn Hamilton and Associates', NOW(), TRUE),
    ('Shawnigan Lake School', NOW(), TRUE),
    ('Shuksan Fisheries Consulting', NOW(), TRUE),
    ('Silvatech Consulting Ltd.', NOW(), TRUE),
    ('Simon Fraser University (SFU) - Biological Sciences', NOW(), TRUE),
    ('SKR Consultants Ltd.', NOW(), TRUE),
    ('SLR Consulting (Canada) Ltd.', NOW(), TRUE),
    ('SNC Lavalin Inc.', NOW(), TRUE),
    ('Splatsin DC - Yucwmenlucwu LLC', NOW(), TRUE),
    ('St at imc Eco-Resources Ltd.', NOW(), TRUE),
    ('Stanley Park Ecology Society', NOW(), TRUE),
    ('Stantec Consulting Ltd.', NOW(), TRUE),
    ('Strategic Forest Management Inc.', NOW(), TRUE),
    ('Strategic Natural Resource Consultants Inc.', NOW(), TRUE),
    ('Sunshine Coast Salmonid Enhancement Society', NOW(), TRUE),
    ('Taan Forest Ltd.', NOW(), TRUE),
    ('Teck Coal Limited', NOW(), TRUE),
    ('Teck Highland Valley Copper Partnership', NOW(), TRUE),
    ('TERA Planning Ltd.', NOW(), TRUE),
    ('Tetra Tech Canada Inc.', NOW(), TRUE),
    ('Tetra Tech EBA', NOW(), TRUE),
    ('Thompson Rivers University', NOW(), TRUE),
    ('Tisdale Environmental Consulting Inc.', NOW(), TRUE),
    ('Titus Biological Services Inc.', NOW(), TRUE),
    ('Toba Montrose Hydro Inc.', NOW(), TRUE),
    ('Trinity Western University', NOW(), TRUE),
    ('Triton Environmental Consultants Ltd.', NOW(), TRUE),
    ('Triton Environmental Consultants Ltd. (Calgary)', NOW(), TRUE),
    ('Triton Environmental Consultants Ltd. (Kamloops)', NOW(), TRUE),
    ('Triton Environmental Consultants Ltd. (Nanaimo)', NOW(), TRUE),
    ('Triton Environmental Consultants Ltd. (Prince George)', NOW(), TRUE),
    ('Triton Environmental Consultants Ltd. (Richmond)', NOW(), TRUE),
    ('Triton Environmental Consultants Ltd. (Terrace)', NOW(), TRUE),
    ('University of Alberta', NOW(), TRUE),
    ('University of Bern, Institute of Ecology and Evolution', NOW(), TRUE),
    ('University of British Columbia', NOW(), TRUE),
    ('University of British Columbia (UBC) - Okanagan', NOW(), TRUE),
    ('University of Calgary', NOW(), TRUE),
    ('University of Lethbridge', NOW(), TRUE),
    ('University of Montana', NOW(), TRUE),
    ('University of Montreal', NOW(), TRUE),
    ('University of New Brunswick', NOW(), TRUE),
    ('University of Northern British Columbia', NOW(), TRUE),
    ('University of Texas at Austin', NOW(), TRUE),
    ('University of Victoria', NOW(), TRUE),
    ('Urban Systems Ltd.', NOW(), TRUE),
    ('uTree Environmental Consultants Ltd.', NOW(), TRUE),
    ('Valley Environmental', NOW(), TRUE),
    ('Vancouver Island University', NOW(), TRUE),
    ('Vast Resource Solutions Inc.', NOW(), TRUE),
    ('Vision Marine Consulting Ltd.', NOW(), TRUE),
    ('Wapta Environmental Consulting Ltd.', NOW(), TRUE),
    ('Watershed Ecological Services Ltd.', NOW(), TRUE),
    ('Western Forest Products Inc.', NOW(), TRUE),
    ('Western Water Associates Ltd.', NOW(), TRUE),
    ('Westland Resources Ltd.', NOW(), TRUE),
    ('Westslope Fisheries', NOW(), TRUE),
    ('White Pine Environmental Resources Inc.', NOW(), TRUE),
    ('Whitehead Environmental Consultants Ltd.', NOW(), TRUE),
    ('Wildlife Infometrics Inc.', NOW(), TRUE),
    ('Wood PLC', NOW(), TRUE),
    ('WorleyParsons Canada Service Ltd.', NOW(), TRUE),
    ('WSP Canada Inc.', NOW(), TRUE),
    ('Yukon Energy Corporation', NOW(), TRUE);
`;

const insertInvestmentActionCategoryRowsForNewAgencyRows = `
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'A Rocha Canada'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Aarde Environmental Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Acres Consulting'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Advisian'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'AECOM Canada Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Alaska Department of Fish and Game'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Alces Environmental Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Allnorth Consultants Limited'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Allouette River Management Society'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'AMEC Earth and Environmental'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Applied Aquatic Research Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Applied Ecological Solutions Corp.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Aquaparian Environmental Consulting Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'AquaSilva Resource Management Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Aqua-Tex Scientific Consulting Ltd. '), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Associated Environmental Consultants Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Association of Wetland Stewards for Clayoquot and Barkley Sounds'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Assuage Environmental Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Aurico Metals Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Avison Management Services Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Azimuth Consulting Group Partnership'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Balanced Ecological Management Company'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Bamfield Marine Sciences Centre'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'BBA Engineering Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'BC Conservation Foundation (BCCF)'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'BCIT Fish Wildlife and Recreation Program'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Burt and Associates'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Canadian Forest Products'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Capital Regional District (CRD)'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Cariboo Environmental Quality Consulting Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Cariboo Envirotech Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Carleton University'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Cascade Environmental Resource Group Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Castus Environmental Services Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Central Westcoast Forest Society'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Chu Cho Environmental'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'City of Abbotsford'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'City of Chilliwack'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'City of Coquitlam'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'City of Kelowna Environment Division'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Clark University'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Clearwater Environmental Consulting'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Coast River Environmental Services Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Coldstream Ecology Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'College of New Caledonia'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Columbia Environmental Consulting Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Columbia Power Corporation'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Colville Confederated Tribes Fish and Wildlife'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Comox Valley Project Watershed Society'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Cooper Beauchesne and Associates Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Copcan Contracting Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Cornice Environmental Consulting Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Corvidae Environmental Consulting Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Crane Creek Enterprises'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'CSR Environmental Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Current Environmental Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'D. Burt and Associates'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'D.R. Clough Consulting'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'David Bustard and Associates Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Davis Environmental Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Dayesi Services'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Department of Fisheries and Oceans (DFO)'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'DGR Consulting'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Dillon Consulting Limited'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'District of Kent'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'District of North Vancouver'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'District of Saanich'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Diversified Environmental Services Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'DWB Consulting Services Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'East Carolina University - Department of Biology'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'EBB Environmental Consulting Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Ecofish Research Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Ecofor Consulting'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Ecologic Consulting Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'EcoMetrix Incorporated'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Ecora Engineering and Resource Group Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Ecoscape Environmental Consultants Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Eco-Web Ecological Consulting Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'EDI Environmental Dynamics Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Elevate Environmental Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Elk River Alliance'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'ENKON Environmental Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Envirologic Consulting Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Environment and Climate Change Canada'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Envirowest Consultants Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'ERM Consultants Canada Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Esther Guimond Consulting'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Estsek Environmental Services LLP'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'EXP Services Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'FINS Consulting Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Fish-Kissing Weasels Environmental'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'ForFish Consulting'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Forsite Consultants Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'FortisBC'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Fraser Valley Watersheds Coalition'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'FSCI Biological Concultants'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'G3 Consulting Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'GeoMarine Environmental Consultants Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'GG Oliver and Associates Environmental Science'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Gitanyow Fisheries Authority'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Gitksan Watershed Authorities'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Golder Associates Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Grassroots Environmental Services'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Hatfield Consulting Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'HCR Environmental Consulting'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Hemmera'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'High Country Consulting'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Hill Environmental Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Hocquard Consulting'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'I.C. Ramsay and Associates'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Ingersol Mountain Enterprise Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Inland Timber Management Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'InStream Fisheries Research Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Interior Reforestation Co. Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'IRC Integrated Resource Consultants Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'ISL Engineering and Land Services Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Iverson & MacKenzie Biological Consulting Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Jacobs Canada Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'JBL Environmental Services Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Karen L Grainger'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Kawa Enginnering Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Kerr Wood Leidal Associates Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Keystone Environmental Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Klohn Crippen Berger Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Knight Piesold Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Ktunaxa Nation Council'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Lake Trail Environmental Consulting'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Letts Environmental Consultants Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'LGL Limited'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Lheidli T Enneh First Nations'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Limnotek Research and Development Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Living Resources Environmental'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Lorax Environmental Services Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Lotic Environmental Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'M.C. Wright and Associates Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Madrone Environmental Services Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Mainstream Aquatics Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Mainstream Biological Consulting Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Marine Harvest Canada'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Marlim Ecological Consulting Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Masse Environmental Consultants Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Matrix Solutions Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Max Planck Institute, Ploen, Germany'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'McCleary Aquatic Systems Consulting'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'McElhanney Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'McGill University, Redpath Museum'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'McTavish Resource & Management Consultants Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Metro Vancouver (GVRD)'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Metro Vancouver Regional Parks'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Michigan State University'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Mid Vancouver Island Habitat Enhancement Society'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Ministry of Environment & Climate Change Strategy'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Ministry of Forests'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Ministry of Forests, Lands, Natural Resource Operations & Rural Development'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Ministry of Lands, Water, and Resource Stewardship'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Ministry of Transportation & Infrastructure'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Minnow Environmental Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Montana Fish, Wildlife & Parks'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Mount Polley Mining Corporation'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Mountain Water Research'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Naito Environmental'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Natural Resources Training Group (NRTG)'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Nautilus Environmental Company Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Nicola Valley Institute of Technology (NVIT)'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'North Coast Skeena First Nations Stewardship Society'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'North River Consulting Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Northern (Arctic) Federal University (NArFU)'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Northern Van Island Salmonid Enhancement Assoc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Northland Environmental Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Northwest Community College'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Nova Pacific Environmental Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Nupqu Development Corporation'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Ogopogo Environmental & Engineering Consultants Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Okanagan Nation Alliance'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Pacificus Biological Services Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Palmer Environmental Consulting Group Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Pearson Ecological'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Peninsula Streams Society'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Phoenix Environmental Services Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Pinchin Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Poisson Consulting Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Polaris Environmental Consultants Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Pottinger Gaherty Environmental Consultants Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Profor Resource Development Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Qqs Projects Society'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Quatse River Hatchery'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Quesnel River Environmental Restoration Services'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Red Chris Development Company Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Redcedar Environmental Consulting Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Resort Municipality of Whistler'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Roy Northern Environmental Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Sage Environmental Consulting Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Salmon Coast Field Station Society'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Sartori Environmental Services Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'School District 54'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Secwepemc Fisheries Commission'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Selkirk College'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'SER Environmental Management'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Seven Generations Environmental Services Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Shawn Hamilton and Associates'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Shawnigan Lake School'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Shuksan Fisheries Consulting'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Silvatech Consulting Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Simon Fraser University (SFU) - Biological Sciences'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'SKR Consultants Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'SLR Consulting (Canada) Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'SNC Lavalin Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Splatsin DC - Yucwmenlucwu LLC'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'St at imc Eco-Resources Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Stanley Park Ecology Society'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Stantec Consulting Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Strategic Forest Management Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Strategic Natural Resource Consultants Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Sunshine Coast Salmonid Enhancement Society'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Taan Forest Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Teck Coal Limited'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Teck Highland Valley Copper Partnership'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'TERA Planning Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Tetra Tech Canada Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Tetra Tech EBA'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Thompson Rivers University'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Tisdale Environmental Consulting Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Titus Biological Services Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Toba Montrose Hydro Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Trinity Western University'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Triton Environmental Consultants Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Triton Environmental Consultants Ltd. (Calgary)'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Triton Environmental Consultants Ltd. (Kamloops)'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Triton Environmental Consultants Ltd. (Nanaimo)'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Triton Environmental Consultants Ltd. (Prince George)'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Triton Environmental Consultants Ltd. (Richmond)'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Triton Environmental Consultants Ltd. (Terrace)'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'University of Alberta'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'University of Bern, Institute of Ecology and Evolution'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'University of British Columbia'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'University of British Columbia (UBC) - Okanagan'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'University of Calgary'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'University of Lethbridge'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'University of Montana'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'University of Montreal'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'University of New Brunswick'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'University of Northern British Columbia'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'University of Texas at Austin'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'University of Victoria'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Urban Systems Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'uTree Environmental Consultants Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Valley Environmental'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Vancouver Island University'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Vast Resource Solutions Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Vision Marine Consulting Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Wapta Environmental Consulting Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Watershed Ecological Services Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Western Forest Products Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Western Water Associates Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Westland Resources Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Westslope Fisheries'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'White Pine Environmental Resources Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Whitehead Environmental Consultants Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Wildlife Infometrics Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Wood PLC'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'WorleyParsons Canada Service Ltd.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'WSP Canada Inc.'), NOW(), 'Not Applicable');
  INSERT INTO INVESTMENT_ACTION_CATEGORY (agency_id, record_effective_date, name) VALUES ((SELECT agency_id FROM agency WHERE name = 'Yukon Energy Corporation'), NOW(), 'Not Applicable');
`;
