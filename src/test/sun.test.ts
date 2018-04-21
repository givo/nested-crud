import { expect } from 'chai';
import * as express from 'express';
import { Sailer } from '../index';
import * as http from 'http';
import { Sun } from './entities/Sun';
import { request, getBody } from './helper';

let port = 3003;

let server: http.Server;
let app = express();
let sailer = new Sailer();

let sun = new Sun(10000000, 4444444444);

describe("Sun", () => {
    before(async () => {
        let sunREST = sailer.singleTone("/sun", sun);
        app.use(sunREST);

        server = app.listen(port);
    });

    after(() => {
        server.close(); 
    });

    //
    // get many /users/1/books
    //
    describe(("get /sun"), () => {
        it('should return the sun', async function () {
            this.timeout(10000);

            http.get(`http://127.0.0.1:${port}/sun`, async (res: http.IncomingMessage) => {
                expect(res.statusCode).to.equal(200);

                let resBody: string = await getBody(res);

                expect(resBody, `Didn't received sun properly: ${resBody}`).to.equal(JSON.stringify(sun.describe()));
            });
        });
    });

    //
    // put /sun
    //
    describe(("put /sun"), () => {
        it('should update the sun', async function () {
            this.timeout(10000);

            let expectedSun = new Sun(88888, 888888);
            expectedSun.id = "1";       // for comparing purposes

            let reqBody = JSON.stringify(expectedSun.describe());
            let resBody = await request(`http://127.0.0.1/sun`, port, 'PUT', reqBody);
            
            expect(resBody, `Didn't update sun`).to.equal(JSON.stringify(expectedSun.describe()));
        });
    });
});