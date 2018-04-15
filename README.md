# nested-crud

## Introduction

`nested-crud` is a library which provides you the tools to create a REST curd service with support for single tones and collections within your application.

The library focus is on helping the programmer write a service with minimium code by supporting nested REST collections.

## Features

* Collection interface 
* Single tone interface
* Nested collections
* Single tone and collection helpers
* `express` based

## How to use

The special thing about this library is the fact that you can nest collections within collection. The library knows how to propagate within your collections untill it reaches the wanted resource, for example:

```
GET /users/15/books/4/pages/1
```

First will get user with id `15` from `users` collection, then book with id `4` from the user's books collection and finally will get page with id `1` from the book's pages collection.

The same behavior will take place for the other HTTP requests.

## Examples

coming..

## License

The MIT License (MIT)

Copyright (c) 2018 Matan Givoni

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
