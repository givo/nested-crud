import { CrudItem } from "../abstract/CrudItem";

export class Page extends CrudItem{
    public number: number;
    public content: string;

    /**
     * Creates an instance of Page.
     * @param {number} [number=-1] Default value is important for CrudItem.update()!
     * @param {string} [content=" "] 
     * @memberof Page
     */
    constructor(number: number = -1, content: string = " "){
        super();
        this.number = number;
        this.content = content;
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