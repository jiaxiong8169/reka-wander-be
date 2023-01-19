import { Test, TestingModule } from '@nestjs/testing';
import { HomestaysService } from './homestays.service';

describe('HomestaysService', () => {
  let service: HomestaysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HomestaysService],
    }).compile();

    service = module.get<HomestaysService>(HomestaysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
