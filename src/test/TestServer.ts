import { expect } from 'chai';
import * as express from 'express';
import * as http from 'http';
import * as assert from 'assert';
import { promisify } from 'util';
import { Cruder } from '../Cruder';
import { ItemsManager } from './abstract/ItemsManager';
import { User } from './foundations/User';
import { Book } from './foundations/Book';
import { Page } from './foundations/Page';

let app = express();
let cruder = new Cruder();

let usersManager = new ItemsManager<User>(<(new () => User)>User);

// create Beni
let beni = new User("Beni", 165);

// create Beni's books
let beniBooks = beni.getCollection("books");
beniBooks.create(new Book("Harry Potter"));
beniBooks.create(new Book("Lord of the Rings"));
let book = new Book("Rich Father Poor Father");
beniBooks.create(book);

// create book's pages
let pages = book.getCollection("pages");
pages.create(new Page(0, "Avishai is the king"));
pages.create(new Page(1, "Avishai is the prince"));
pages.create(new Page(2, "Avishai is the queen"));
pages.create(new Page(3, "Avishai is the knight"));
pages.create(new Page(4, "Avishai is the slave"));
pages.create(new Page(5, "Avishai is the goblin"));

// create all users
usersManager.create(new User("Yosi", 174));
usersManager.create(beni);
usersManager.create(new User("Shlomi", 188));
usersManager.create(new User("Shimon", 180));

let usersREST = cruder.listen('/users/:userId', usersManager);
let booksREST = cruder.listen('/users/:userId/books/:bookId', usersManager);
let pagesREST = cruder.listen('/users/:userId/books/:bookId/pages/:pageId', usersManager);
app.use(usersREST);
app.use(booksREST);
app.use(pagesREST);

app.listen(3000, () => {
    console.log('listening on port 3000');
});