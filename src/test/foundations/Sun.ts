import { ICrudItem, IDescriptor, ICrudCollection } from "../../index";

export class Sun implements ICrudItem{
    public size: number;
    public heat: number;

    id: string;

    constructor(size: number, heat: number){
        this.id = "1";
        this.size = size;
        this.heat = heat;
    }

    public async read(): Promise<any> {
        return this;
    }

    public async update(item: any): Promise<IDescriptor> {
        if(item.size){
            this.size = item.size;
        }

        if(item.heat){
            this.heat = item.heat;
        }

        return this;
    }

    public getCollection(collectionName: string): ICrudCollection | undefined {
        return undefined;
    }

    public describe() {
        return {
            size: this.size,
            heat: this.heat
        };
    }
}