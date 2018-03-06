import { IDescriptor, IParam } from "../../index";
import { BasicItem } from "../../helpers/BasicItem";
import { ICrudCollection } from "../../abstract/ICrudCollection";
import { Book } from "./Book";
import { ItemsManager } from "../../helpers/ItemsManager";

export class User extends BasicItem{
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

    public async update(fields: any){
        super.update(fields);

        if(fields["books"] && fields["books"] instanceof ItemsManager){
            this.books = fields["books"];
        }
    }
}