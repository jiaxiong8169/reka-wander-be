import { Test, TestingModule } from '@nestjs/testing';
import { VictualsService } from './victuals.service';

describe('VictualsService', () => {
  let service: VictualsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VictualsService],
    }).compile();

    service = module.get<VictualsService>(VictualsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
