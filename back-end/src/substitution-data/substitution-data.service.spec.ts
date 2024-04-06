import {Test, TestingModule} from '@nestjs/testing';
import {SubstitutionDataService} from './substitution-data.service';

describe('SubstitutionDataService', () => {
    let service: SubstitutionDataService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SubstitutionDataService],
        }).compile();

        service = module.get<SubstitutionDataService>(SubstitutionDataService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
