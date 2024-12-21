import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorEntity } from 'src/entity/instructor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InstructorEntity])],
  providers: [],
})
export class InstructorModule {}
