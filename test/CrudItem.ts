import { IDescriptor } from "../src/abstract/IDescriptor";

export class CrudItem implements IDescriptor{    
    public update(fields: any){
        for(let param in fields){
            if((<any>this)[param] && (<any>fields)[param] !== Object((<any>fields)[param])){
                (<any>this)[param] = fields[param];
            }
        }
    }

    describe() {
        return this;
    }
}