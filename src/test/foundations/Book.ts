import { ICrudCollection } from "../../abstract/ICrudCollection";
import { Page } from "./Page";
import { BasicItem } from "../../helpers/BasicItem";
import { ItemsManager } from "../../helpers/ItemsManager";

export class Book extends BasicItem{
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

    public async update(fields: any){
        super.update(fields);

        if(fields["pages"] && fields["pages"] instanceof ItemsManager){
            this.pages = fields["pages"];
        }
    }
}