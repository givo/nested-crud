import * as http from 'http';
import { expect } from 'chai';

export async function request(url: string, port: number, method: string, data?: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        let options = {
            host: 'localhost',
            path: url,
            port: port,
            method: method,            
        };

        if(data){
            (<any>options)['headers'] = {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }

        let req = http.request(options, async (res) => {
            expect(res.statusCode).to.equal(200);

            resolve(await getBody(res));
        });

        if(data){
            req.write(data);
        }

        req.end();
    });
}

export function getBody(res: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        let body = '';

        res.on('data', (data) => {
            body += data;
        });

        res.on('end', () => {
            resolve(body);
        });
    });
}