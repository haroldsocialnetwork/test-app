import { Module } from '@nestjs/common';
import { HelloController } from './hello.controller';
import { HelloService } from './hello.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [HelloController],
  providers: [HelloService, PrismaService],
})
export class HelloModule {}
