import {
  Logger,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as MailListener from 'mail-listener2';
import * as nodemailer from 'nodemailer';

interface Email {
  text: string;
  subject: string;
  from: Array<{ address: string; name: string }>;
  to: Array<{ address: string; name: string }>;
  region?: string;
  link?: string;
  item?: string;
}

@Injectable()
export class EmailListenerService implements OnModuleInit, OnModuleDestroy {
  private mailListener: MailListener;
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailListenerService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.NODE_MAILER_PASSWORD,
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
      tlsOptions: { rejectUnauthorized: false },
      markSeen: true,
      fetchUnreadOnStart: true,
      attachments: true,
      attachmentOptions: { directory: 'attachments/' },
    });

    this.mailListener.on('mail', this.handleMail.bind(this));
    this.mailListener.on('attachment', this.handleAttachment.bind(this));
    this.mailListener.on('error', this.handleError.bind(this));
    this.mailListener.on('end', this.handleEnd.bind(this));
  }

  private async handleMail(mail: Email) {
    const mailFromTarget = mail.from.findIndex(
      (el) => el.address == process.env.LISTEN_FOR_EMAIL,
    );

    let email: Email = {
      from: mail.from,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
    };

    if (mailFromTarget > -1) {
      this.logger.warn('Got email from target');
      console.log('New email received From Target:', email);

      email = await this.extractMailFeatures(email);

      console.log(email.link, email.item, email.region);
      await this.sendReplyEmail(email);
    } else {
      this.logger.log('Got public email');
      console.log('New email received Public:', email);
    }
  }

  private handleAttachment(attachment) {
    this.logger.log('New attachment received:', attachment);
    // Handle the attachment
  }

  private handleError(err) {
    this.logger.error('Mail Listener Error:', err);
  }

  private handleEnd() {
    this.logger.warn('Mail Listener has stopped.');
  }

  private extractMailFeatures(email: Email): Promise<Email> {
    return new Promise((resolve, reject) => {
      try {
        const regionAndLinkRegex =
          /https:\/\/www\.hermes\.com\/(\w+)\/([\s\S]*?)(?=>)/;
        const regionAndLinkMatch = email.text.match(regionAndLinkRegex);
        email.region = regionAndLinkMatch ? regionAndLinkMatch[1] : 'Unknown';
        email.link = regionAndLinkMatch
          ? `https://www.hermes.com/${regionAndLinkMatch[1]}/${regionAndLinkMatch[2]}`
          : 'Unknown';

        const urlPattern =
          /<https:\/\/www\.hermes\.com\/[\s\S]*?>\n\n([\s\S]*?)\n/;
        const itemNameMatch = email.text.match(urlPattern);
        email.item = itemNameMatch ? itemNameMatch[1].trim() : 'Unknown';

        resolve(email);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async sendReplyEmail(mail: Email) {
    const mailOptions = {
      from: process.env.EMAIL,
      to: mail.from[0].address,
      subject: `Re: ${mail.subject}`,
      text: `Hello, this is an automated reply to your email.\n\nReceived:\n${mail.text}\n\nExtracted:\nRegion: ${mail.region}\nItem: ${mail.item}\nLink: ${mail.link}`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Reply email sent:', info.response);
      this.logger.log('Email sent to subscriber');
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
