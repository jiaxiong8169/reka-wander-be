import { Module } from '@nestjs/common';
import { Vehicle, VehicleSchema } from 'src/schemas/vehicle.schema';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vehicle.name, schema: VehicleSchema }]),
  ],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
