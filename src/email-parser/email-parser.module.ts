import { Module } from '@nestjs/common';
import { EmailParserService } from './email-parser.service';
import { EmailParserController } from './email-parser.controller';

@Module({
  providers: [EmailParserService],
  controllers: [EmailParserController]
})
export class EmailParserModule {}
