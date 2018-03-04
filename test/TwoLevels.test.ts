import { expect } from 'chai';
import * as express from 'express';
import { Cruder } from '../src/index';
import { User } from './User';
import * as http from 'http';
import * as assert from 'assert';
import { promisify } from 'util';
import { ItemsManager } from './ItemsManager';
import { Book } from './Book';

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
        it('should return all users', function (done) {
            this.timeout(10000);

            http.get(`http://127.0.0.1:${port}/users/1/books`, async (res) => {
                expect(res.statusCode).to.equal(200);

                let body = await getBody(res);
                
                expect(body, `Didn't received users properly, received: ${body}`).to.equal(JSON.stringify(beniBooks.describe()));

                done();                
            });
        });
    });

    //
    // 
    //
    describe(("get /users/1/books/1"), () => {
        it('should return all users', function (done) {
            this.timeout(10000);

            http.get(`http://127.0.0.1:${port}/users/1/books/1`, async (res) => {
                expect(res.statusCode).to.equal(200);

                let body = await getBody(res);

                expect(body, `Didn't received user with id 1 properly`).to.equal(JSON.stringify(beniBooks.readById((1).toString())));

                done();
            });
        });
    });
});

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