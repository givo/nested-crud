import { IDescriptor, ICrudItem } from "../../index";
import { ICrudCollection } from "../../abstract/ICrudCollection";
import { Book } from "./Book";
import { BooksCollection } from "./BooksCollection";

export class User implements ICrudItem{
    id: string;

    private _booksCounter = 0;
    private books: BooksCollection;

    constructor(id: string, public name: string = " ", public height: number = 1){
        this.id = id;
        this.name = name;
        this.height = height;
        
        this.books = new BooksCollection();
    }

    public describe(): any{
        let description = {
            id: this.id,
            name: this.name,
            height: this.height,
            books: this.books.describe(),
        }

        return description;
    }

    public async update(fields: any): Promise<IDescriptor>{
        if(fields["books"] && fields["books"] instanceof BooksCollection){
            this.books = fields["books"];
        }

        if("name" in fields){
            this.name = fields.name;
        }
        if("height" in fields){
            this.height = fields.height;
        }

        return this;
    }

    public async read(): Promise<any> {
        return this;
    }

    public getCollection(collectionName: string): ICrudCollection<ICrudItem> | undefined {
        let collection: ICrudCollection<ICrudItem> | undefined;

        if(collectionName == "books"){
            collection = this.books;
        }

        return collection;
    }
}