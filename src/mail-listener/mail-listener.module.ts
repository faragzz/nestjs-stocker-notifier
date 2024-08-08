import { Module } from '@nestjs/common';
import { EmailListenerService } from './mail-listener.service';
import { MailListenerController } from './mail-listener.controller';

@Module({
  controllers: [MailListenerController],
  providers: [EmailListenerService],
})
export class MailListenerModule {}
