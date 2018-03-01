import { IDescriptor } from "../src/abstract/IDescriptor";
import { ICrudItem } from "../src/abstract/ICrudItem";
import { ICrudCollection } from "../src/index";

export class CrudItem implements IDescriptor, ICrudItem{    
    
    public async update(fields: any): Promise<any>{
        for(let param in fields){
            if((<any>this)[param] && (<any>fields)[param] !== Object((<any>fields)[param])){
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