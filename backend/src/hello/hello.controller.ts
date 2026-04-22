import { Controller, Get, Post, Body } from '@nestjs/common';
import { HelloService } from './hello.service';

@Controller('api/hello')
export class HelloController {
  constructor(private readonly helloService: HelloService) {}

  @Get()
  async getMessages() {
    const messages = await this.helloService.getMessages();
    return { messages };
  }

  @Post()
  async createMessage(@Body() body: { text: string; author?: string }) {
    const message = await this.helloService.createMessage(
      body.text,
      body.author,
    );
    return { message };
  }
}
