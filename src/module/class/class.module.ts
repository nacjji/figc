import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassEntity } from 'src/entity/class.entity';
import { InstructorEntity } from 'src/entity/instructor.entity';
import { ModuleEntity } from 'src/entity/module.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassEntity, ModuleEntity, InstructorEntity]),
  ],
  providers: [],
})
export class ClassModule {}
