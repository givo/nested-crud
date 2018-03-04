import { expect } from 'chai';
import * as express from 'express';
import { Cruder } from '../index';
import { User } from './foundations/User';
import * as http from 'http';
import * as assert from 'assert';
import { promisify } from 'util';
import { ItemsManager } from './foundations/ItemsManager';
import { Book } from './foundations/Book';

let port = 3001;

let app = express();
let cruder = new Cruder();

let usersManager = new ItemsManager<User>();

usersManager.create(new User("Yosi", 174));

let beni = new User("Beni", 165)
let beniBooks = beni.getCollection("books");
beniBooks.create(new Book("Harry Potter"));
beniBooks.create(new Book("Lord of the Rings"));
usersManager.create(beni);

usersManager.create(new User("Shlomi", 188));
usersManager.create(new User("Shimon", 180));

describe("Curder - Collections", () => {
    before(async () => {
        let booksREST = cruder.listen('/users/:userId/books/:bookId', usersManager);
        app.use(booksREST);

        app.listen(port);
    });

    //
    // get many /users/1/books
    //
    describe(("get /users/1/books"), () => {
        it('should return all books of user 1', async function () {
            this.timeout(10000);

            http.get(`http://127.0.0.1:${port}/users/1/books`, async (res: http.IncomingMessage) => {
                let resBody: string = await getBody(res);

                expect(resBody, `Didn't received books of user 1 properly, received: ${resBody}`).to.equal(JSON.stringify(beniBooks.describe()));
            });
        });
    });

    //
    // get /users/1/books/1
    //
    describe(("get /users/1/books/1"), () => {
        it('should return book with id 1 of user 1', async function () {
            this.timeout(10000);

            http.get(`http://127.0.0.1:${port}/users/1/books/1`, async (res: http.IncomingMessage) => {
                let resBody: string = await getBody(res);

                let expectedBook = await beniBooks.readById('1');
                expect(resBody, `Didn't received book with id 1 properly`).to.equal(JSON.stringify(expectedBook.describe()));
            });
        });
    });

    //
    // update /users/1/books/1
    //
    describe(("put /users/1/books/1"), () => {
        it('should update book with id 1', async function () {
            this.timeout(10000);

            let expectedBook = new Book("Poor Father Rich Father");

            let reqBody = JSON.stringify(expectedBook);
            let resBody = await request(`http://127.0.0.1/users/1/books/1`, 'PUT', reqBody);

            expect(resBody, `Didn't update book with id 1`).to.equal(JSON.stringify(expectedBook.describe()));
        });
    });
});

async function request(url: string, method: string, data: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        let options = {
            host: 'localhost',
            path: url,
            port: port,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        http.request(options, async (res) => {
            expect(res.statusCode).to.equal(200);

            resolve(await getBody(res));
        }).write(data);
    });
}

function getBody(res: http.IncomingMessage): Promise<string> {
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