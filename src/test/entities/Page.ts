import { ICrudItem, ICrudCollection } from "../../index";
import { IDescriptor } from "../../abstract/IDescriptor";

export class Page implements ICrudItem{
    id: string;
    public number: number;
    public content: string;

    /**
     * Creates an instance of Page.
     * @param {number} [number=-1] Default value is important for BasicItem.update()!
     * @param {string} [content=" "] 
     * @memberof Page
     */
    constructor(id: string, number: number = -1, content: string = " "){        
        this.id = id;
        this.number = number;
        this.content = content;
    }

    public async read(): Promise<any> {
        return this;
    }

    public async update(item: any): Promise<IDescriptor> {
        for(let param in item){
            if((<any>this)[param]){
                (<any>this)[param] = item[param];
            }
        }

        return this;
    }

    public getCollection(collectionName: string): ICrudCollection<ICrudItem> | undefined {
        return undefined;
    }

    public describe(): any{
        let description = {
            number: this.number,
            content: this.content,
            id: this.id
        }

        return description;
    }
}