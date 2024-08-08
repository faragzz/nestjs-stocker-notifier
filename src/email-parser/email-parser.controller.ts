import { Controller, Get, Param } from '@nestjs/common';
import { EmailParserService } from './email-parser.service';
import { EmailParseResponse } from './type/emailParseRespone';

@Controller('email-parser')
export class EmailParserController {
  constructor(private emailParserService: EmailParserService) {}

  @Get('fetch-emails')
  fetchEmails(): Promise<any> {
    return this.emailParserService.fetchAllEmails();
  }

  @Get('fetch-email/:subject')
  async fetchEmail(
    @Param('subject') sub: string,
  ): Promise<EmailParseResponse[]> {
    console.log(sub);
    return await this.emailParserService.fetchEmailByFrom(sub);
  }
}
