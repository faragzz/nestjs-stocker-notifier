import { Injectable } from '@nestjs/common';
import * as Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import { EmailParseResponse } from './type/emailParseRespone';

@Injectable()
export class EmailParserService {
  private limitSearch = 10;
  private readonly imapConfig = {
    user: process.env.EMAIL,
    password: process.env.PASSWORD,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
  };

  private connectToImap(): Imap {
    return new Imap(this.imapConfig);
  }

  private handleError(err: Error, reject: (reason?: any) => void): void {
    console.error('IMAP Error:', err);
    reject(err);
  }
  private markAsSeen(imap, uid) {
    imap.addFlags(uid, ['\\Seen'], (err) => {
      if (err) {
        console.error('Error marking email as seen:', err);
      } else {
        console.log('Marked email as read!');
      }
    });
  }

  fetchAllEmails(): Promise<EmailParseResponse[]> {
    const imap = this.connectToImap();
    const data: EmailParseResponse[] = [];

    return new Promise((resolve, reject) => {
      imap.once('ready', () => {
        imap.openBox('INBOX', false, (err, box) => {
          if (err) {
            this.handleError(err, reject);
            return;
          }

          imap.search(
            ['UNSEEN', ['X-GM-RAW', 'category:primary']],
            (err, results) => {
              if (err) {
                this.handleError(err, reject);
                return;
              }

              if (!results.length) {
                console.log('No unseen emails in the Primary tab.');
                imap.end();
                resolve(data);
                return;
              }

              const f = imap.fetch(results, { bodies: '' });
              f.on('message', (msg) => {
                msg.on('body', (stream) => {
                  simpleParser(stream, (err, parsed) => {
                    if (err) {
                      this.handleError(err, reject);
                      return;
                    }
                    data.push(parsed);
                    console.log('From:', parsed.from.text);
                  });
                });
                msg.on('attributes', (msg) => {
                  if (msg.uid) {
                    this.markAsSeen(imap, msg.uid);
                  }
                });
              });

              f.once('end', () => {
                console.log('Done fetching all messages!');
                imap.end();
                resolve(data);
              });
            },
          );
        });
      });

      imap.once('error', (err) => this.handleError(err, reject));
      imap.once('end', () => console.log('Connection ended'));

      imap.connect();
    });
  }

  fetchEmailByFrom(specificSubject: string): Promise<EmailParseResponse[]> {
    const startTime = Date.now();
    const imap = this.connectToImap();
    const data: EmailParseResponse[] = [];

    return new Promise((resolve, reject) => {
      imap.once('ready', () => {
        imap.openBox('INBOX', false, (err, box) => {
          if (err) {
            this.handleError(err, reject);
            return;
          }

          imap.search(['UNSEEN'], (err, results) => {
            if (err) {
              this.handleError(err, reject);
              return;
            }

            if (!results.length) {
              console.log('No unseen emails found.');
              imap.end();
              resolve(data);
              return;
            }

            const f = imap.fetch(results, { bodies: '' });
            f.on('message', (msg) => {
              msg.on('body', (stream) => {
                simpleParser(stream, (err, parsed) => {
                  if (err) {
                    this.handleError(err, reject);
                    return;
                  }
                  if (parsed.from.text.includes(specificSubject)) {
                    data.push(parsed);

                    console.log('Subject:', parsed.subject);
                    console.log('From:', parsed.from.text);
                    console.log('Body:', parsed.text);
                  }
                });
              });
              msg.on('attributes', (msg) => {
                if (msg.uid) {
                  this.markAsSeen(imap, msg.uid);
                }
              });
            });

            f.once('end', () => {
              const endTime = Date.now();
              console.log(
                `Processing time: ${(endTime - startTime) / 1000} seconds`,
              );
              console.log('Done fetching all messages!');
              imap.end();
              resolve(data);
            });
          });
        });
      });

      imap.once('error', (err) => this.handleError(err, reject));
      imap.once('end', () => {
        console.log('Connection ended');

        resolve(data);
      });

      imap.connect();
    });
  }
}
