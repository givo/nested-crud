# nested-crud

## Introduction

The library is on it's very early days but stable, code comments are partial, missing documentation, contribution guide and a number of features.

`nested-crud` is a library which provides you the tools to create a REST curd service with support for single tones and collections within your application.

The library focus is on helping the programmer write a service with minimium code by supporting nested REST collections.

## Features

* Collection interface 
* Single tone interface
* **Nested collections**
* In memory single tone and collection implementation included 
* **express** based
* written in **Typescript**

## Roadmap

* supoort for `after` and `before` middlewares.
* mongoose
* `filter` and `limit` support in `ItemsManager<T>`
* support for `HTTP-Patch`

## How does it works

### The Magic

The special thing about this library is the fact that you can nest collections within collections. The library knows how to propagate within your collections untill it reaches the desired resource, for example:

```
GET /users/15/books/4/pages/1
```

* First the library will get the user with id `15` from a registered `users` collection
* Then book with id `4` from the user's books collection
* And Finally will get the page with id `1` from the book's pages collection.

The same behavior will take place for all other HTTP requests..

The magic is done by using an OOP aproach. You simply need to implement two interfaces:

* `ICrudCollection` in your collection 
* `ICrudItem` in each item within a collection

Then register your collection using `cruder.collection()` (new name will be chosen in the near future)

### Item Description

Every item that is returned to the client should have a description. An item description is the way you expose the item in your API. Most of the time you'll want to hide some internal members. In order to return a description you simply need to override `describe()` function and return a new object which holds only the members that you want to expose, for example:

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

**A good practice is to expect the client to send the same structure in each API route.**

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
export class UsersCollection extends ICrudCollection{
    protected _users: Map<string, User>;    

    public async create(item: any): Promise<string> {
        let newUser = new User((this._itemsCounter++).toString(), item.name);        

        this._items.set(newUser.id, newUser);

        return newUser.id;
    }
    
    public async readById(id: string): Promise<IDescriptor> {
        return <T>this._items.get(id);
    }
    
    // return all items
    public async readMany(limit?: number | undefined, filter?: IParam[] | undefined): Promise<IDescriptor[]> {
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

How to register:

``` typescript
let app = express();
let cruder = new Cruder();

let usersManager = new UsersCollection();

let usersREST = cruder.collection('/users/:userId', usersManager);
let booksREST = cruder.collection('/users/:userId/books/:bookId', usersManager);
let pagesREST = cruder.collection('/users/:userId/books/:bookId/pages/:pageId', usersManager);
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
