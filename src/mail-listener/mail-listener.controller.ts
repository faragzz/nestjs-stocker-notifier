import { Controller } from '@nestjs/common';
import { EmailListenerService } from './mail-listener.service';

@Controller('mail-listener')
export class MailListenerController {
  constructor(private readonly EmailListenerService: EmailListenerService) {}
}
