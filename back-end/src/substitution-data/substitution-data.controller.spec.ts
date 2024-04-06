import {Test, TestingModule} from '@nestjs/testing';
import {SubstitutionDataController} from './substitution-data.controller';

describe('SubstitutionDataController', () => {
    let controller: SubstitutionDataController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SubstitutionDataController],
        }).compile();

        controller = module.get<SubstitutionDataController>(SubstitutionDataController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
