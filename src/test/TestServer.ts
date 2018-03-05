import { expect } from 'chai';
import * as express from 'express';
import * as http from 'http';
import * as assert from 'assert';
import { promisify } from 'util';
import { Cruder } from '../Cruder';
import { ItemsManager } from './abstract/ItemsManager';
import { User } from './foundations/User';
import { Book } from './foundations/Book';

let app = express();
let cruder = new Cruder();

let usersManager = new ItemsManager<User>(<(new () => User)>User);

// create beni
let beni = new User("Beni", 165);
let beniBooks = beni.getCollection("books");
beniBooks.create(new Book("Harry Potter"));
beniBooks.create(new Book("Lord of the Rings"));

// create all users
usersManager.create(new User("Yosi", 174));
usersManager.create(beni);
usersManager.create(new User("Shlomi", 188));
usersManager.create(new User("Shimon", 180));

let usersREST = cruder.listen('/users/:userId', usersManager);
let booksREST = cruder.listen('/users/:userId/books/:bookId', usersManager);
app.use(usersREST);
app.use(booksREST);

app.listen(3000, () => {
    console.log('listening on port 3000');
});