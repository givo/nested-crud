<img src="https://github.com/givo/sailer/blob/master/sailer-logo.png?raw=true" width="288">

## Introduction

`sailer` is a server-side library for creating a RESTful API service with support for nested resources. The library focus is on helping the programmer write a RESTful service with minimium code.

## Important Note

The library is on it's very early days but stable. Code comments are partial, documentation is being written, contribution guide is missing and a number of features.

## Features

* Collection interface 
* Single tone interface
* **Nested collections**
* In memory collection implementation included 
* **express** based
* Written in **Typescript**

## Roadmap

* supoort for `after` and `before` middlewares.
* support and mongodb style `filter` 
* `filter` and `limit` support in `ItemsManager<T>`
* mongoose
* api for error handling 
* support for `HTTP-Patch`

## How does it work

The special thing about this library is the fact that you can nest collections within collections. The library knows how to propagate within your collections untill it reaches the desired resource, for example:

```
GET /users/15/books/4/pages/1
```

* First the library will get user with id `15` from a preregistered `users` collection
* Then book with id `4` from the user's books collection
* And Finally the page with id `1` from the book's pages collection.

The same behavior will take place for all other HTTP requests..

The magic is done by using an OOP aproach. You simply need to implement two interfaces:

* `ICrudCollection` in your collection 
* `ICrudItem` in each item within a collection

and register your collection using `sailer.collection()`.

## Getting Started

### Step 1: install sailer

```
npm install --save sailer
```

### Step 2: Implement `ICrudCollection`

```typescript
import { ICrudCollection } from 'sailer';

class UserCollection implements ICrudCollection<User>{
...
...
...
}
```

### Step 3: Implement `ICrudItem`

```typescript
import { ICrudItem } from 'sailer';

class User implements ICrudItem{
...
...
...
}
```

### Step 4: Register your collection with sailer

```typescript
import { Sailer } from 'sailer';
import { UserCollection } from './UserCollection';
import * as express from 'express';

const sailer = new Sailer();
const app = express();

const userCollection = new UserCollection();
const usersREST = sailer.collection('/users/:userId', userCollection);
app.use(usersREST);

app.listen(() => {
    console.log("server has started");
});
```

## API

* Data formatting is `JSON` based therefore server sends and receives data in `JSON` format. 

* The action mapping is as follows: (users collection) 

```
POST    /users              ->  create a new user
GET     /users/:userId      ->  get user with specific id
GET     /users              ->  get multiple users (support for filter and limit soon)
PUT     /users/:userId      ->  update a specific user
PUT     /users              ->  update multiple users (support for filter and limit soon)
DELETE  /users/:userId      ->  delete a specific user
DELETE  /users/             ->  delete multiple users (support for filter and limit soon)
```

* The action mapping for nested items is the same:

```
POST    /users/:userId/books/           ->  create a new book inside a specific user's books
GET     /users/:userId/books/:bookId    ->  get a specific book from a specific user's books
GET     /users/:userId/books            ->  get multiple books of a specific user (support for filter and limit soon)
PUT     /users/:userId/books/:bookId    ->  update a specific book from a specific users' books
PUT     /users/:userId/books            ->  update multiple books of a specific (support for filter and limit soon)
DELETE  /users/:userId/books/:bookId    ->  delete a specific book from a specific user's book
DELETE  /users/:userId/books            ->  delete multiple books of a specific user (support for filter and limit soon)
```

* And so on for any nesting level..

## Item Description

Every item that is returned to the client should have a description. An item description is the way you expose the item in your API. Most of the time you'll want to hide some internal members and in that case you simply need to return a description object in `describe()` which holds only the members that you seek to expose, for example:

``` typescript
class User implements ICrudItem{
    protected name: string;
    protected height: number;
    protected isAdmin: boolean;
    
    public describe(): any{
        return {
            name: this.name;
            height: this.height;
            // hide `isAdmin` member
        }
    }
}
```

**A good practice is to expect the client to send the same structure as your description in each API route.**

## Error Handling

Currently any error that is thrown from your classes is catched by `sailer` and returned to the client with the thrown object in the response body with http 500 status code - `INTERNAL_SERVER_ERROR`.

**An error throwing api will be added in the near future.**

## Examples

An example for implementing a class which contains a collection and is contained within another collection:

``` typescript
export class User implements ICrudItem{ 
    protected _id: string;
    
    // users/:userId/books/:bookId
    protected books: BooksCollection;
    
    // assignment to `id` is only allowed when using the constructor
    public get id(): string{
        return this._id;
    }
    
    // will be called from usersCollection.create()
    constructor(id: string, public name: string, public height: number, private privateMember: string){       
        this._id = id;
        this.name = name;
        this.height = height;        
        this.privateMember = privateMember;
        this.books = new BooksCollection();
    }
    
    public getCollection(collectionName: string): ICrudCollection<ICrudItem> | undefined{
        let collection: ICrudCollection<ICrudItem>;
        
        if(collectionName == "books"){
            collection = this.books;
        }
        
        return collection;
    }
    
    // return a description of user and not a full representation
    public describe(): any{
        let description = {
            id: this.id,
            name: this.name,
            height: this.height,
            books: this.books.describe(),   // get a description of books collection 
        }

        return description;
    }
    
    public async update(fields: any): Promise<IDescriptor>{
        // override each property except books collection
        for(let prop in fields){
            let currentProp = (<any>this)[prop];
            if(currentProp && prop != "books"){
                (<any>this)[prop] = fields[param];
            }
        }
        
        return this;
    }
    
    // no need to implement ICrudItem.read(), the function is logical, intended for single tones 
    public async read(): Promise<any>{
        
    }
}
```

An example for creating a collection: 

``` typescript
export class UsersCollection extends ICrudCollection<User>{
    protected _users: Map<string, User>;    

    public async create(fields: any): Promise<string> {
        let newUser = new User((this._itemsCounter++).toString(), item.name);        

        this._items.set(newUser.id, newUser);

        return newUser.id;
    }
    
    public async readById(id: string): Promise<User> {
        return <T>this._items.get(id);
    }
    
    // return all items
    public async readMany(limit?: number | undefined, filter?: IParam[] | undefined): Promise<User[]> {
        let items: any[] = new Array<any>();
        
        this._items.forEach((item: T, id: string) => {
            items.push(item);
        });

        return items;
    }
    ...
    ...
    ...
}
```

How to register your routes:

``` typescript
let app = express();
let sailer = new Sailer();

let usersManager = new UsersCollection();

let usersREST = sailer.collection('/users/:userId', usersManager);
let booksREST = sailer.collection('/users/:userId/books/:bookId');  // no need to specify the root collection after a previous call with the same base route
let pagesREST = sailer.collection('/users/:userId/books/:bookId/pages/:pageId');
app.use(usersREST);
app.use(booksREST);
app.use(pagesREST);

app.listen(3000, () => {
    console.log('listening on port 3000');
});
```

## License

The MIT License (MIT)

Copyright (c) 2018 Matan Givoni

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
