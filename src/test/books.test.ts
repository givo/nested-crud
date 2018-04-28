import { expect } from 'chai';
import * as express from 'express';
import { Sailer } from '../index';
import { User } from './entities/User';
import * as http from 'http';
import * as assert from 'assert';
import { promisify } from 'util';
import { Book } from './entities/Book';
import { request, getBody } from './helper';
import { UsersCollection } from './entities/UsersCollection';
import { BooksCollection } from './entities/BooksCollection';

let port = 3001;

let server: http.Server;
let app = express();
let sailer = new Sailer();

let usersManager = new UsersCollection();
let beni: User;
let beniBooks: BooksCollection;

describe("Books", () => {
    before(async () => {
        let booksREST = sailer.collection('/users/:userId/books/:bookId', usersManager);
        app.use(booksREST);

        usersManager.create({ name: "Yosi", height: 174 });
        usersManager.create({ name: "Beni", height: 165 });
        usersManager.create({ name: "Shlomi", height: 188 });
        usersManager.create({ name: "Shimon", height: 190 });

        beni = <User>await usersManager.readById("1");
        beniBooks = <BooksCollection>beni.getCollection("books");

        beniBooks.create(new Book("Harry Potter"));
        beniBooks.create(new Book("Lord of the Rings"));    

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

            let reqBody = {
                fields: {
                    name: "Poor Father Rich Father",
                }
            };
            
            let resBody = await request(`http://127.0.0.1/users/1/books/1`, port, 'PUT', JSON.stringify(reqBody));

            let book1 = <Book>await beniBooks.readById("1");
            expect(book1.name, `Didn't update book with id 1`).to.equal(reqBody.fields.name);
        });
    });

    //
    // update many /users/1/books
    //
    describe(("put /users/1/books"), () => {
        it('should update all books of user 1', async function () {
            this.timeout(10000);

            let reqBody = {
                fields: {
                    name: "The Alchemist",
                }
            };

            let resBody = await request(`http://127.0.0.1/users/1/books`, port, 'PUT',  JSON.stringify(reqBody));

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