import { expect } from 'chai';
import * as express from 'express';
import { Cruder } from '../index';
import { User } from './foundations/User';
import * as http from 'http';
import * as assert from 'assert';
import { promisify } from 'util';
import { Book } from './foundations/Book';
import { Page } from './foundations/Page';
import { request, getBody } from './helper';
import { UsersCollection } from './foundations/UsersCollection';
import { PagesCollection } from './foundations/PagesCollection';

let port = 3002;
let server: http.Server;
let app = express();
let cruder = new Cruder();

let usersManager = new UsersCollection();

// create beni
let beni = new User("Beni", 165);

// create beni's book
let beniBooks = beni.getCollection("books");
beniBooks.create(new Book("Harry Potter"));
beniBooks.create(new Book("Lord of the Rings"));
let book = new Book("Rich Father Poor Father");
beniBooks.create(book);


// create book's pages
let pages = <PagesCollection>book.getCollection("pages");
pages.create(new Page(0));
pages.create(new Page(1));
pages.create(new Page(2));
pages.create(new Page(3));
pages.create(new Page(4));
pages.create(new Page(5));

usersManager.create(new User("Yosi", 180));
usersManager.create(beni);
usersManager.create(new User("Shlomi", 180));
usersManager.create(new User("Maor", 180));


describe("Pages", () => {
    before(async () => {
        let paegsREST = cruder.listen('/users/:userId/books/:bookId/pages/:pageId', usersManager);
        app.use(paegsREST);

        server = app.listen(port);
    });

    after(() => {
        server.close(); 
    });

    //
    // create /users/1/books/1/pages
    //
    describe(("create /users/1/books/2/pages"), () => {
        it('should create a new page of book 2 of user 1', async function () {
            this.timeout(10000);

            let newPage: Page = new Page(50, "Avishai is the king");

            let reqBody = JSON.stringify(newPage);
            let resBody = await request(`http://127.0.0.1/users/1/books/2/pages`, port, 'POST', reqBody);

            let newPageId = JSON.parse(resBody).id;
            expect(newPageId, `Didn't received page id 6`).to.equal("6");
        });
    });

    //
    // get many /users/1/books/2/pages
    //
    describe(("get /users/1/books/2/pages"), () => {
        it('should return all pages of book 2 of user 1', async function () {
            this.timeout(10000);

            http.get(`http://127.0.0.1:${port}/users/1/books/2/pages`, async (res: http.IncomingMessage) => {
                let resBody: string = await getBody(res);

                let expectedPages = pages.describe();
                expect(resBody, `Didn't received all pages of book 2, received: ${resBody}`).to.equal(JSON.stringify(expectedPages));
            });
        });
    });

    //
    // get by id /users/1/books/2/pages/3
    //
    describe(("get /users/1/books/2/pages/3"), () => {
        it('should return page with id 3 of book 2 of user 1', async function () {
            this.timeout(10000);

            http.get(`http://127.0.0.1:${port}/users/1/books/2/pages/3`, async (res: http.IncomingMessage) => {
                let resBody: string = await getBody(res);

                let expectedPage = await pages.readById('3');
                expect(resBody, `Didn't received page with id 3 properly`).to.equal(JSON.stringify(expectedPage.describe()));
            });
        });
    });

    //
    // update by id /users/1/books/1
    //
    describe(("put /users/1/books/2/pages/2"), () => {
        it('should update page with id 2 of book 2 of user 1', async function () {
            this.timeout(10000);

            let fields = {
                content: "Avishai is the king",
                id: (<Page>await pages.readById('2')).id
            };            

            let reqBody = JSON.stringify(fields);
            let resBody = await request(`http://127.0.0.1/users/1/books/2/pages/2`, port, 'PUT', reqBody);
            
            expect((await pages.readById('2') as Page).content, `Didn't update page with id 2`).to.equal(fields.content);
        });
    });

    //
    // update many /users/1/books/2/pages
    //
    describe(("put /users/1/books/2/pages"), () => {
        it('should update all pages of book 2 of user 1', async function () {
            this.timeout(10000);

            let fields = {
                content: "Avishai is the prince"
            };

            let reqBody = JSON.stringify(fields);
            let resBody = await request(`http://127.0.0.1/users/1/books/2/pages`, port, 'PUT', reqBody);

            resBody = JSON.parse(resBody).count;
            expect(resBody, `Didn't update all pages of book 2`).to.equal(7);

            expect((await pages.readById('2') as Page).content, `Didn't update page with id 2`).to.equal(fields.content);
        });
    });

    //
    // delete /users/1/books/2/pages/5
    //
    describe(("delete /users/1/books/2/pages/5"), () => {
        it('should delete page 5 of book 2 of user 1', async function () {
            this.timeout(10000);

            let pageToDelete = await pages.readById('5');

            let resBody = await request(`http://127.0.0.1/users/1/books/2/pages/5`, port, 'DELETE');            

            expect(resBody, `Didn't delete page with id 5`).to.equal(JSON.stringify(pageToDelete.describe()));
        });
    });

    //
    // delete many /users/1/books/2/pages
    //
    describe(("delete /users/1/books/2/pages"), () => {
        it('should delete all pages of book 2 of user 1', async function () {
            this.timeout(10000);

            let resBody = await request(`http://127.0.0.1/users/1/books/2/pages`, port, 'DELETE');            
            let deleted = JSON.parse(resBody).count;

            expect(deleted, `Didn't delete all 7 pages`).to.equal(6);
        });
    });
});