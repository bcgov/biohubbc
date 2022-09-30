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

    async process(): Promise<void> {

    }
}