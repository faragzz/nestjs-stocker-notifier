import { Controller, Get } from '@nestjs/common';
import { EmailParserService } from './email-parser.service';

@Controller('email-parser')
export class EmailParserController {
    constructor(private emailParserService:EmailParserService){}
    
    @Get('fetch-emails')
    fetchEmails(){
        this.emailParserService.fetchEmails();
    }
}
