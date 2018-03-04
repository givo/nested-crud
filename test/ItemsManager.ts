import { ICrudCollection, IParam, IDescriptor } from "../src/index";
import { CrudItem } from "./CrudItem";

export class ItemsManager<T extends CrudItem> implements ICrudCollection{
    private _itemsCounter = 0;
    private _items: Map<string, T>;

    constructor(){
        this._items = new Map<string, T>();
    }

    async create(item: any): Promise<string> {
        this._items.set((this._itemsCounter++).toString(), item);

        return (this._itemsCounter - 1).toString();
    }

    async readMany(limit?: number | undefined, filter?: IParam[] | undefined): Promise<IDescriptor[]> {
        let items: any[] = new Array<any>();

        this._items.forEach((item: T, id: string) => {
            items.push(item);
        });

        return items;
    }

    async readById(id: string): Promise<IDescriptor> {
        return <T>this._items.get(id);
    }

    async updateMany(fields: any, limit?: number | undefined, filter?: IParam[] | undefined): Promise<number> {        
        this._items.forEach((item, id) => {
            item.update(fields);
        });

        return this._items.size;
    }

    async updateById(id: string, fields: any): Promise<IDescriptor> {
        let item = <T>this._items.get(id);

        if(item){
            item.update(fields);
        }

        return item;
    }

    async deleteById(id: string): Promise<IDescriptor> {
        let item = <T>this._items.get(id);

        if(item){
            this._items.delete(id);
        }

        return item;
    }

    async deleteMany(limit: number, filter: IParam[]): Promise<number> {
        let size = this._items.size;

        this._items.clear();

        return size;
    }

    public describe() {
        let items = Array<T>();

        this._items.forEach((item, id) => {
            items.push(item);
        });

        return items;
    }
}