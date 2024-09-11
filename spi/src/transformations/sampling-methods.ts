import SQL from 'sql-template-strings';
import { IDBConnection } from '../db';

export const transformSamplingMethods = async (connection: IDBConnection): Promise<void> => {
    console.log('Transforming Sampling Methods');
  
    const sql = SQL`
-------------------------------------------------------------------------------------------------
--- Inserting into technique the survey ids from sampling sites, and a name -- 
-- sampling techniques are only created for surveys where sampling sites exist - since methods are dependent on sample sites ---

    WITH w_method_lookups AS (SELECT ml.method_lookup_id, s.survey_id, ml.name
            FROM 
                biohub.survey s
            JOIN 
                public.spi_surveys sp ON s.spi_survey_id = sp.survey_id
            JOIN 
                biohub.method_lookup ml ON 
                CASE 
                        WHEN sp.method_type_cd = 'OBS_MAWE_SNTR' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_TSAL_SEQS' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_SONG_SPMA_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_MSTC_DETC_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_GAME_ENTR_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_CNFB_AERS_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'ROOS_ELK_CLASS_1.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_RIVB_TERL_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_BATS_ROST_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_WOCO_SITR_2.1' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_MAMU_MAFT_2.0' THEN 'Radar'
                        WHEN sp.method_type_cd = 'OBS_MSTC_SNTR_2.1' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'HAN_BIRD_CAPF_2.0' THEN 'Mist Net'
                        WHEN sp.method_type_cd = 'HAN_BIRD_CAPF_2.1' THEN 'Mist Net'
                        WHEN sp.method_type_cd = 'OBS_PSAL_CAPS_2.0' THEN 'Pitfall Trap'
                        WHEN sp.method_type_cd = 'OBS_PSAL_TRAN_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = git'OBS_BAPT_SRCA_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'HAN_WOCO_CAPF_2.0' THEN 'Placeholder Gun Net'
                        WHEN sp.method_type_cd = 'OBS_BAPT_LARV_2.0' THEN 'Handheld net'
                        WHEN sp.method_type_cd = 'OBS_BAPT_AUDI_2.0' THEN 'Placeholder Audio Encounter'
                        WHEN sp.method_type_cd = 'TELEMETRY_DATA' THEN 'Placeholder Radio'
                        WHEN sp.method_type_cd = 'OBS_WATR_BRCO' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_MAMU_MVFT' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_WATR_PBCO' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_UNGG_TOCO_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_SNAK_TRAN_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_SNAK_HACO_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'NON_STAN_OBS_BECO' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_RAPT_ENTR_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_BEAR_SIGN_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_CNFB_NECO_2.1' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_PISC_FWTR_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_MSTC_SNTR' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_WOOD_ENTR_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_RAPT_CPLB' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_UNGA_SABL' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_BAPT_TETR_2.0' THEN 'Pitfall Trap'
                        WHEN sp.method_type_cd = 'OBS_PSAL_TCQS_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_SMAM_CAPS_2.1' THEN 'Box or live trap'
                        WHEN sp.method_type_cd = 'OBS_UNGG_SLCO_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_WOOD_CPLB_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_BATS_TRAP' THEN 'Mist Net'
                        WHEN sp.method_type_cd = 'OBS_WATR_NBCO' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'HERPETILE_GROUP_DATA_1.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'NON_STAN_BAIT_SIGN' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_UNGG_CLASS_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_BATS_MNHT_2.1' THEN 'Mist Net'
                        WHEN sp.method_type_cd = 'Bird Call Playback' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_TFPG_HACO_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_RAPT_STWA_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_UNGA_EFWT_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_SONG_ENTR_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_UNGG_PECO_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'NON_STAN_COUNT' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_UNGA_CLASS_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_SMAM_CAPS_2.0' THEN 'Box or live trap'
                        WHEN sp.method_type_cd = 'OBS_BATS_MNHT_2.0' THEN 'Mist Net'
                        WHEN sp.method_type_cd = 'BIRD_DETECTION_1.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_INIT_TEL_1.0' THEN 'Placeholder Radio'
                        WHEN sp.method_type_cd = 'OBS_MAMU_FOSU_2.0' THEN 'Radar'
                        WHEN sp.method_type_cd = 'Wildlife Camera' THEN 'Camera trap'
                        WHEN sp.method_type_cd = 'OBS_BATS_DETC_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_OWL_NEST' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'NON_STAN_RAP_NEST' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'Bat Acoustic' THEN 'Placeholder Audio Encounter'
                        WHEN sp.method_type_cd = 'OBS_SONG_PTCO_2.0' THEN 'Point Count'
                        WHEN sp.method_type_cd = 'Bird Nest Descriptions' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'Herp Capture Or Handling Or Class Or Count' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_INIT_TEL_1.2' THEN 'Placeholder Radio'
                        WHEN sp.method_type_cd = 'OBS_OWL_CLPB' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_UNGA_CENS_1.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_INIT_TEL_1.1' THEN 'Placeholder Radio'
                        WHEN sp.method_type_cd = 'HERPETILE_INDIVIDUAL_DATA_1.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'Bird Nest Visits' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_RAPT_CPLB_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'OBS_UNGA_SABL_2.0' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'NON_STAN_OBS_SGN' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'Rare Plants and Fungi' THEN 'Visual Encounter'
                        WHEN sp.method_type_cd = 'Ungulate Census' THEN 'Visual Encounter'
                        ELSE 'Undetermined'
                    END = ml.name;
            )
    INSERT INTO biohub.method_technique (survey_id, name, method_lookup_id, description)
    SELECT 
        sss.survey_id, 
        ml.name,
        method_lookup_id,
        'Came from SPI' AS description
    FROM 
        biohub.survey_sample_site sss
    LEFT JOIN w_method_lookups wml ON
        wml.survey_id = sss.survey_id;

----------------- INSERTING technique outputs INTO survey_sample_method ------
    INSERT INTO biohub.survey_sample_method (survey_sample_site_id, method_technique_id)


    FROM biohub.survey s
    WHERE s.spi_survey_id IS NOT NULL
    JOIN survey_sample_site sss ON
    sss.survey_id = s.survey_id
    
  

    -- survey sample site id comes from survey samples site
    -- method_technique_id comes from joining survey sapmle site id onto survey sample site table on survey sample id, and then grabbing the survey id from that table
    -- and using that survey id to join on method_technique table in the survey_id column and then inserting the method_technique_id into the survey_sample_method method_technique id
    -- for each method technique, insert into method the technique into all sample sites join on biohub.survey WHERE spi_survey_id is not NULL 
    `;

<<<<<<< HEAD
  await connection.sql(transformSamplingMethods);
=======
  await connection.sql(sql);
>>>>>>> 7da2dd8bc4e8ae79bd8ba7d5fe88f728a08518aa

  console.log('Successfully transformed Sampling Methods');
};
