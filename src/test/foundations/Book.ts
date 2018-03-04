import { ICrudCollection } from "../../abstract/ICrudCollection";
import { Page } from "./Page";
import { CrudItem } from "./CrudItem";

export class Book extends CrudItem{
    public name: string;
    public pages: Page[];

    constructor(name: string){
        super();
        this.name = name;
        this.pages = new Array<Page>();
    }
}