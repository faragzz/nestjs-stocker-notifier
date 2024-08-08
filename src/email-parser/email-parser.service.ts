import { Injectable } from '@nestjs/common';
import * as Imap from 'node-imap';
import { simpleParser } from 'mailparser';

@Injectable()
export class EmailParserService {
    private readonly imapConfig = {
        user: 'a.khaled46462@gmail.com',
        password: 'ttwj rzmy czdr vtxx',
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
      };
    
      fetchEmails() {
        const imap = new Imap(this.imapConfig);
    
        imap.once('ready', () => {
          imap.openBox('INBOX', true, (err, box) => {
            if (err) throw err;
    
            imap.search(['UNSEEN'], (err, results) => {
              if (err) throw err;
              const f = imap.fetch(results, { bodies: '' });
    
              f.on('message', (msg) => {
                msg.on('body', (stream) => {
                  simpleParser(stream, (err, parsed) => {
                    if (err) throw err;
                    console.log('Subject:', parsed.subject);
                    console.log('From:', parsed.from.text);
                    console.log('Body:', parsed.text);
                  });
                });
              });
    
              f.once('end', () => {
                console.log('Done fetching all messages!');
                imap.end();
              });
            });
          });
        });
    
        imap.once('error', (err) => {
          console.log(err);
        });
    
        imap.once('end', () => {
          console.log('Connection ended');
        });
    
        imap.connect();
      }
}
