import { expect } from 'chai';
import * as express from 'express';
import { Sailer } from '../index';
import { User } from './entities/User';
import * as http from 'http';
import * as assert from 'assert';
import { promisify } from 'util';
import { Book } from './entities/Book';
import { Page } from './entities/Page';
import { request, getBody } from './helper';
import { UsersCollection } from './entities/UsersCollection';
import { PagesCollection } from './entities/PagesCollection';
import { BooksCollection } from './entities/BooksCollection';

let port = 3002;
let server: http.Server;
let app = express();
let sailer = new Sailer();

let usersManager = new UsersCollection();
let beni: User;
let beniBooks: BooksCollection;
let book: Book;
let pages: PagesCollection;


describe("Pages", () => {
    before(async () => {
        let paegsREST = sailer.collection('/users/:userId/books/:bookId/pages/:pageId', usersManager);
        app.use(paegsREST);

        usersManager.create({ name: "Yosi", height: 174 });
        usersManager.create({ name: "Beni", height: 165 });
        usersManager.create({ name: "Shlomi", height: 188 });
        usersManager.create({ name: "Shimon", height: 190 });

        beni = <User>await usersManager.readById("1");
        beniBooks = <BooksCollection>beni.getCollection("books");
        await beniBooks.create({ name: "Harry Potter" });
        await beniBooks.create({ name: "Lord of the Rings" });
        await beniBooks.create({ name: "Rich Father Poor Father" });
        book = <Book>await beniBooks.readById("2");

        pages = <PagesCollection>book.getCollection("pages");
        pages.create({ number: 0 });
        pages.create({ number: 1 });
        pages.create({ number: 2 });
        pages.create({ number: 3 });
        pages.create({ number: 4 });
        pages.create({ number: 5 });

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

            let reqBody = {
                fields: {
                    content: "Avishai is the king",
                    number: 50,                    
                }
            };   
            
            let resBody = await request(`http://127.0.0.1/users/1/books/2/pages`, port, 'POST', JSON.stringify(reqBody));

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

            let reqBody = {
                fields: {
                    content: "Avishai is the king",
                    id: (<Page>await pages.readById('2')).id
                }
            };            
            
            let resBody = await request(`http://127.0.0.1/users/1/books/2/pages/2`, port, 'PUT', JSON.stringify(reqBody));
            
            expect((await pages.readById('2') as Page).content, `Didn't update page with id 2`).to.equal(reqBody.fields.content);
        });
    });

    //
    // update many /users/1/books/2/pages
    //
    describe(("put /users/1/books/2/pages"), () => {
        it('should update all pages of book 2 of user 1', async function () {
            this.timeout(10000);

            let reqBody = {
                fields: {
                    content: "Avishai is the prince"
                }
            };
        
            let resBody = await request(`http://127.0.0.1/users/1/books/2/pages`, port, 'PUT', JSON.stringify(reqBody));

            resBody = JSON.parse(resBody).count;
            expect(resBody, `Didn't update all pages of book 2`).to.equal(7);

            expect((await pages.readById('2') as Page).content, `Didn't update page with id 2`).to.equal(reqBody.fields.content);
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