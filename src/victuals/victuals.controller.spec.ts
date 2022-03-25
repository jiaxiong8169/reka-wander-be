import { Test, TestingModule } from '@nestjs/testing';
import { VictualsController } from './victuals.controller';

describe('VictualsController', () => {
  let controller: VictualsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VictualsController],
    }).compile();

    controller = module.get<VictualsController>(VictualsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
