import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class HelloService {
  constructor(private readonly prisma: PrismaService) {}

  async getMessages() {
    return this.prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMessage(text: string, author = 'User') {
    return this.prisma.message.create({
      data: { text, author },
    });
  }
}
