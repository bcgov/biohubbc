import { IDBConnection } from '../database/db';
import { ITemplateData, TemplateRepository } from '../repositories/template-repository';
import { DBService } from './db-service';

export class TemplateService extends DBService {
  templateRepository: TemplateRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.templateRepository = new TemplateRepository(connection);
  }

  async getAllTemplates(): Promise<ITemplateData[]> {
    return this.templateRepository.getAllTemplates();
  }
}
