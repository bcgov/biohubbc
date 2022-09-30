import { RequestHandler } from "express";
import { IDBConnection } from "../database/db";
import { ValidationRepository } from "../repositories/validation-repository";
import { getLogger } from "../utils/logger";
import { DBService } from "./service";

const defaultLog = getLogger('services/dwc-service');

export class ValidationService extends DBService {
    validationRepository: ValidationRepository;

    constructor(connection: IDBConnection) {
        super(connection);

        this.validationRepository = new ValidationRepository(connection)
    }

    async create(): Promise<void> {

    }
}

export class FileProcessingService extends DBService {
    constructor(connection: IDBConnection) {
        super(connection);
    }

    async processFile(): Promise<void> {

    }

    // general setup
    process_step1_getOccurrenceSubmission(): RequestHandler {
        return async (req, res, next) => {
            
        }
    }

    process_step2_getOccurrenceSubmissionInputS3Key(): RequestHandler {
        return async (req, res, next) => {}
    }

    process_step3_getS3File(): RequestHandler {
        return async (req, res, next) => {}
    }

    process_step4_prepXLSX(): RequestHandler {
        return async (req, res, next) => {}
    }

    process_step5_persistParseErrors(): RequestHandler {
        return async (req, res, next) => {}
    }

    process_step6_sendResponse(): RequestHandler {
        return async (req, res, next) => {}
    }

    // xlsx validation
    process_step7_getValidationSchema(): RequestHandler {
        return async (req, res, next) => {}
    }
    process_step8_getValidationRules(): RequestHandler {
        return async (req, res, next) => {}
    }
    process_step9_validateXLSX(): RequestHandler {
        return async (req, res, next) => {}
    }
    process_step10_persistValidationResults(): RequestHandler {
        return async (req, res, next) => {}
    }

    // xlsx transform functions
    process_step11_getTransofrmationSchema(): RequestHandler {
        return async (req, res, next) => {}
    }
    process_step12_getTransformationRules(): RequestHandler {
        return async (req, res, next) => {}
    }
    process_step13_transformXLSX(): RequestHandler {
        return async (req, res, next) => {}
    }
    process_step14_persistTransformationResults(): RequestHandler {
        return async (req, res, next) => {}
    }

    // scrape functions
    process_step15_getOccurrenceSubmission(): RequestHandler {
        return async (req, res, next) => {}
    }
    process_step16_getSubmissionOutputS3Key(): RequestHandler {
        return async (req, res, next) => {}
    }
    process_step17_getS3File(): RequestHandler {
        return async (req, res, next) => {}
    }
    process_step18_prepDWCArchive(): RequestHandler {
        return async (req, res, next) => {}
    }
    process_step19_scrapeAndUploadOccurrences(): RequestHandler {
        return async (req, res, next) => {}
    }
}