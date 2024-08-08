import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailParserModule } from './email-parser/email-parser.module';
import { ConfigModule } from '@nestjs/config';
import { MailListenerModule } from './mail-listener/mail-listener.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), EmailParserModule, MailListenerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
