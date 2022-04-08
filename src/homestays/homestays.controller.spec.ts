import { Test, TestingModule } from '@nestjs/testing';
import { HomestaysController } from './homestays.controller';

describe('HomestaysController', () => {
  let controller: HomestaysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomestaysController],
    }).compile();

    controller = module.get<HomestaysController>(HomestaysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
