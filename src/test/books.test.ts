import { expect } from 'chai';
import * as express from 'express';
import { Cruder } from '../index';
import { User } from './foundations/User';
import * as http from 'http';
import * as assert from 'assert';
import { promisify } from 'util';
import { Book } from './foundations/Book';
import { request, getBody } from './helper';
import { UsersCollection } from './foundations/UsersCollection';

let port = 3001;

let server: http.Server;
let app = express();
let cruder = new Cruder();

let usersManager = new UsersCollection();

usersManager.create(new User("Yosi", 174));

// beni
let beni = new User("Beni", 165)
let beniBooks = beni.getCollection("books");
beniBooks.create(new Book("Harry Potter"));
beniBooks.create(new Book("Lord of the Rings"));

usersManager.create(beni);
usersManager.create(new User("Shlomi", 188));
usersManager.create(new User("Shimon", 180));

describe("Books", () => {
    before(async () => {
        let booksREST = cruder.collection('/users/:userId/books/:bookId', usersManager);
        app.use(booksREST);

        server = app.listen(port);
    });

    after(() => {
        server.close(); 
    });

    //
    // create /users/1/books
    //
    describe(("create /users/1/books"), () => {
        it('should create a new book for user 1', async function () {
            this.timeout(10000);

            let expectedBook: Book = new Book("Poor Father Rich Father");

            let reqBody = JSON.stringify(expectedBook.describe());
            let resBody = await request(`http://127.0.0.1/users/1/books`, port, 'POST', reqBody);

            resBody = JSON.parse(resBody).id;
            expect(resBody, `Didn't update book with id 1`).to.equal("2");
        });
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
    // get by id /users/1/books/1
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
    // update by id /users/1/books/1
    //
    describe(("put /users/1/books/1"), () => {
        it('should update book with id 1', async function () {
            this.timeout(10000);

            let expectedBook = new Book("Poor Father Rich Father");
            expectedBook.id = "1";

            let reqBody = JSON.stringify(expectedBook.describe());
            let resBody = await request(`http://127.0.0.1/users/1/books/1`, port, 'PUT', reqBody);

            expect(resBody, `Didn't update book with id 1`).to.equal(JSON.stringify(expectedBook.describe()));
        });
    });

    //
    // update many /users/1/books
    //
    describe(("put /users/1/books"), () => {
        it('should update all books of user 1', async function () {
            this.timeout(10000);

            let expectedBook = new Book("The Alchemist");

            let reqBody = JSON.stringify(expectedBook);
            let resBody = await request(`http://127.0.0.1/users/1/books`, port, 'PUT', reqBody);

            resBody = JSON.parse(resBody).count;
            expect(resBody, `Didn't update all books of user 1`).to.equal(3);
        });
    });

    //
    // delete /users/1/books/1
    //
    describe(("delete /users/1/books/1"), () => {
        it('should delete book 1 of user 1', async function () {
            this.timeout(10000);

            let bookToDelete = await beniBooks.readById('1');

            let resBody = await request(`http://127.0.0.1/users/1/books/1`, port, 'DELETE');            

            expect(resBody, `Didn't receive deleted book with id 1`).to.equal(JSON.stringify(bookToDelete.describe()));
        });
    });

    //
    // delete many /users/1/books
    //
    describe(("delete /users/1/books"), () => {
        it('should delete book 1 of user 1', async function () {
            this.timeout(10000);

            let resBody = await request(`http://127.0.0.1/users/1/books`, port, 'DELETE');            
            let deleted = JSON.parse(resBody).count;

            expect(deleted, `Didn't delete all 2 books`).to.equal(2);
        });
    });
});