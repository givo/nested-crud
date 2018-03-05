import { ICrudCollection } from "../../abstract/ICrudCollection";
import { Page } from "./Page";
import { CrudItem } from "../abstract/CrudItem";

export class Book extends CrudItem{
    public name: string;
    public pages: Page[];

    constructor(name: string = " "){
        super();
        this.name = name;
        this.pages = new Array<Page>();
    }

    public describe(): any{
        let description = {
            id: this.id,
            name: this.name,            
            pages: this.pages,
        }

        return description;
    }
}