import { IDescriptor, IParam } from "../src/index";
import { CrudItem } from "./CrudItem";
import { ICrudCollection } from "../src/abstract/ICrudCollection";
import { Book } from "./Book";
import { ItemsManager } from "./ItemsManager";

export class User extends CrudItem{
    private _booksCounter = 0;
    private books: ItemsManager<Book>;

    constructor(public name: string, public height: number){
        super();
        
        this.name = name;
        this.height = height;

        this.books = new ItemsManager<Book>();
    }

    public describe(): any{
        let description = {
            name: this.name,
            height: this.height,
            books: this.books.describe(),
        }

        return description;
    }
}