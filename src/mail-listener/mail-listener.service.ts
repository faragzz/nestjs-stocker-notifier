import {
  Logger,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as MailListener from 'mail-listener2';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailListenerService implements OnModuleInit, OnModuleDestroy {
  private mailListener: MailListener;
  private transporter: nodemailer.Transporter;

  private readonly logger = new Logger(EmailListenerService.name);
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL, // Your email address
        pass: process.env.NODE_MAILER_PASSWORD, // Your email password or app-specific password
      },
    });

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
      const email = {
        from: mail.from,
        to: mail.to,
        subject: mail.subject,
        text: mail.text,
      };
      if (mailFromTarget > -1) {
        this.logger.warn('got email from target');

        console.log('New email received From Target:', email);
      } else {
        this.logger.log('got public email');
        console.log('New email received Public:', email);
      }
      this.sendReplyEmail(email);

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

  private async sendReplyEmail(mail: any) {
    const mailOptions = {
      from: process.env.EMAIL,
      to: mail.from[0].address, // Replace with the recipient's email
      subject: `Re: ${mail.subject}`,
      text: `Hello, this is an automated reply to your email.\n\nReceived:\n${mail.text}`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Reply email sent:', info.response);
    } catch (error) {
      console.error('Error sending email:', error);
    }
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
