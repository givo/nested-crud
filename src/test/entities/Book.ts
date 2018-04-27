import { ICrudCollection } from "../../abstract/ICrudCollection";
import { Page } from "./Page";
import { ICrudItem } from "../../index";
import { PagesCollection } from "./PagesCollection";

export class Book implements ICrudItem{
    id: string;
    public name: string;
    public pages: PagesCollection;
    
    constructor(id: string, name: string = " "){        
        this.id = id;
        this.name = name;
        this.pages = new PagesCollection();
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
        if(fields.name){
            this.name = fields.name;
        }
        
        if(fields["pages"] && fields["pages"] instanceof PagesCollection){
            this.pages = fields["pages"];
        }

        return this;
    }

    public async read(): Promise<any> {
        return this;
    }

    public getCollection(collectionName: string): ICrudCollection<ICrudItem> | undefined {
        let collection: ICrudCollection<ICrudItem> | undefined;

        if(collectionName == "pages"){
            collection = this.pages;
        }

        return collection;
    }
}