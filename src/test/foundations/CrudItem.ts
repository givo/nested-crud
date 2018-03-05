import { IDescriptor } from "../../abstract/IDescriptor";
import { ICrudItem } from "../../abstract/ICrudItem";
import { ICrudCollection } from "../../index";

export class CrudItem implements IDescriptor, ICrudItem{    
    private _id: string;

    get id(): string{
        return this._id;
    }

    set id(id: string){
        this._id = id;
    }

    public async update(fields: any): Promise<any>{
        for(let param in fields){
            if((<any>this)[param]){
                (<any>this)[param] = fields[param];
            }
        }

        return this;
    }
    
    public read(): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public getCollection(collectionName: string): ICrudCollection {
        return (<any>this)[collectionName];
    }

    public describe() {
        return this;
    }
}