import { IDescriptor } from "../src/index";
import { CrudItem } from "./CrudItem";

export class User extends CrudItem{    
    constructor(public name: string, public height: number){
        super();

        this.name = name;
        this.height = height;
    }
}