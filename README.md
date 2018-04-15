# nested-crud

## Introduction

The library is on it's very early days but stable, code comments are partial, missing documentation, contribution guide and a number of features.

`nested-crud` is a library which provides you the tools to create a REST curd service with support for single tones and collections within your application.

The library focus is on helping the programmer write a service with minimium code by supporting nested REST collections.

## Features

* Collection interface 
* Single tone interface
* Nested collections
* In memory single tone and collection implementation included 
* `express` based

## How does it works

The special thing about this library is the fact that you can nest collections within collection. The library knows how to propagate within your collections untill it reaches the desired resource, for example:

```
GET /users/15/books/4/pages/1
```

First the library will get the user with id `15` from a registered `users` collection, then the book with id `4` from the user's books collection and finally will get the page with id `1` from the book's pages collection.

The same behavior will take place for the other HTTP requests..

The magic is done by using an OOP aproach. You simply need to implement two interfaces:

* `ICrudCollection` in your collection 
* `ICrudItem` in each item within a collection

## Examples

An example for implementing a class which contains a collection and is contained within another collection:

``` typescript
export class User implements ICrudItem{
    protected _booksCounter = 0;
    
    protected _id: string;
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
    
    // no need to implement ICrudItem.read() is logical, intended for single tones 
    public async read(): Promise<any>{
        
    }
}
```

An example for creating a collection: 

``` Typescript
export class UsersCollection extends ICrudItem{
    protected _users: Map<string, User>;    

    public async create(item: any): Promise<string> {
        let newUser = new User((this._itemsCounter++).toString(), item.name);        

        this._items.set(newUser.id, newUser);

        return newUser.id;
    }
    
    
}
```

## License

The MIT License (MIT)

Copyright (c) 2018 Matan Givoni

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
