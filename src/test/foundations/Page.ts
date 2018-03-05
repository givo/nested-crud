import { CrudItem } from "../abstract/CrudItem";

export class Page extends CrudItem{
    private number: number;
    private content: string;

    constructor(number: number, content: string = " "){
        super();
        this.number = number;
        this.content = content;
    }

    public describe(): any{
        return this;
    }
}