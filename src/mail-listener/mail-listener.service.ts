import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as MailListener from 'mail-listener2';

@Injectable()
export class EmailListenerService implements OnModuleInit, OnModuleDestroy {
  private mailListener: MailListener;

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
      console.log(
        'New email received:',
        mail.text,
        mail.from,
        mail.to,
        mail.subject,
      );

      // Handle the new email
    });

    this.mailListener.on('attachment', (attachment) => {
      console.log('New attachment received:', attachment);
      // Handle the attachment
    });

    this.mailListener.on('error', (err) => {
      console.error('Mail Listener Error:', err);
    });

    this.mailListener.on('end', () => {
      console.log('Mail Listener has stopped.');
    });
  }

  onModuleInit() {
    this.mailListener.start();
    console.log('Mail Listener started.');
  }

  onModuleDestroy() {
    this.mailListener.stop();
    console.log('Mail Listener stopped.');
  }
}
