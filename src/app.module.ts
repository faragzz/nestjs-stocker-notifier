import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailParserModule } from './email-parser/email-parser.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), EmailParserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
