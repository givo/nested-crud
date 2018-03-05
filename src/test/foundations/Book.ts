import { ICrudCollection } from "../../abstract/ICrudCollection";
import { Page } from "./Page";
import { CrudItem } from "../abstract/CrudItem";
import { ItemsManager } from "../abstract/ItemsManager";

export class Book extends CrudItem{
    public name: string;
    public pages: ItemsManager<Page>;

    constructor(name: string = " "){
        super();
        this.name = name;
        this.pages = new ItemsManager<Page>(<(new () => Page)>Page);
    }

    public describe(): any{
        let description = {
            id: this.id,
            name: this.name,            
            pages: this.pages.describe(),
        }

        return description;
    }
}