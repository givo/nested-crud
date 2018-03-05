import { IDescriptor, IParam } from "../../index";
import { CrudItem } from "./CrudItem";
import { ICrudCollection } from "../../abstract/ICrudCollection";
import { Book } from "./Book";
import { ItemsManager } from "./ItemsManager";

export class User extends CrudItem{
    private _booksCounter = 0;
    private books: ItemsManager<Book>;

    constructor(public name: string = " ", public height: number = 1){
        super();
        
        this.name = name;
        this.height = height;
        
        this.books = new ItemsManager<Book>(<(new () => Book)>Book);
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
}