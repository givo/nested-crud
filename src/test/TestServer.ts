import { expect } from 'chai';
import * as express from 'express';
import * as http from 'http';
import * as assert from 'assert';
import { promisify } from 'util';
import { Sailer } from '../Sailer';
import { User } from './entities/User';
import { Book } from './entities/Book';
import { Page } from './entities/Page';
import { UsersCollection } from './entities/UsersCollection';
import { PagesCollection } from './entities/PagesCollection';
import { BooksCollection } from './entities/BooksCollection';

(async () => {
    let app = express();
    let sailer = new Sailer();
    
    let usersManager = new UsersCollection();

    usersManager.create({ name: "Yosi", height: 174 });
    usersManager.create({ name: "Beni", height: 165 });
    usersManager.create({ name: "Shlomi", height: 188 });
    usersManager.create({ name: "Shimon", height: 190 });

    let beni = <User>await usersManager.readById("1");
    let beniBooks = <BooksCollection>beni.getCollection("books");
    await beniBooks.create({ name: "Harry Potter" });
    await beniBooks.create({ name: "Lord of the Rings" });
    await beniBooks.create({ name: "Rich Father Poor Father" });
    let book = <Book>await beniBooks.readById("2");

    let pages = <PagesCollection>book.getCollection("pages");
    pages.create({ number: 0 });
    pages.create({ number: 1 });
    pages.create({ number: 2 });
    pages.create({ number: 3 });
    pages.create({ number: 4 });
    pages.create({ number: 5 });
    
    let usersREST = sailer.collection('/users/:userId', usersManager);
    let booksREST = sailer.collection('/users/:userId/books/:bookId', usersManager);
    let pagesREST = sailer.collection('/users/:userId/books/:bookId/pages/:pageId', usersManager);
    app.use(usersREST);
    app.use(booksREST);
    app.use(pagesREST);
    
    app.listen(3000, () => {
        console.log('listening on port 3000');
    });
})();