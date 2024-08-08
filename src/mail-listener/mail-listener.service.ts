import {
  Logger,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as MailListener from 'mail-listener2';

@Injectable()
export class EmailListenerService implements OnModuleInit, OnModuleDestroy {
  private mailListener: MailListener;
  private readonly logger = new Logger(EmailListenerService.name);
  constructor() {
    this.mailListener = new MailListener({
      username: process.env.EMAIL,
      password: process.env.PASSWORD,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      mailbox: 'INBOX',
      searchFilter: ['UNSEEN'],
      tlsOptions: {
        rejectUnauthorized: false, // Allow self-signed certificates
      },
      markSeen: true, // Set to true if you want to mark emails as read
      fetchUnreadOnStart: true,
      attachments: true,
      attachmentOptions: { directory: 'attachments/' },
    });

    this.mailListener.on('mail', (mail, seqno, attributes) => {
      const mailFromTarget = mail.from.findIndex(
        (el) => el.address == process.env.LISTEN_FOR_EMAIL,
      );
      if (mailFromTarget > -1) {
        this.logger.warn('got email from target');
        console.log(
          'New email received From Target:',
          mail.from,
          mail.to,
          mail.subject,
          mail.text,
        );
      } else {
        this.logger.log('got public email');
        console.log(
          'New email received Public:',
          mail.from,
          mail.to,
          mail.subject,
          mail.text,
        );
      }

      // Handle the new email
    });

    this.mailListener.on('attachment', (attachment) => {
      this.logger.log('New attachment received:', attachment);
      // Handle the attachment
    });

    this.mailListener.on('error', (err) => {
      this.logger.error('Mail Listener Error:', err);
    });

    this.mailListener.on('end', () => {
      this.logger.warn('Mail Listener has stopped.');
    });
  }

  onModuleInit() {
    this.mailListener.start();
    this.logger.log('Mail Listener started.');
  }

  onModuleDestroy() {
    this.mailListener.stop();
    this.logger.warn('Mail Listener stopped.');
  }
}
