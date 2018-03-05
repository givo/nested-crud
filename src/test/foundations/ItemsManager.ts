import { ICrudCollection, IParam, IDescriptor } from "../../index";
import { CrudItem } from "./CrudItem";

export interface NoParamConstructor<T>{
    new (): T;
}

export class ItemsManager<T extends CrudItem> implements ICrudCollection{        
    private _itemsCounter = 0;
    private _items: Map<string, T>;
    private ctor: (new () => T);

    /**
     * Creates an instance of ItemsManager.
     * 
     * @param {(new () => T)} ctor Constructor of T, in order to create a new T on create()
     * @memberof ItemsManager
     */
    constructor(ctor: (new () => T)){                
        this._items = new Map<string, T>();
        this.ctor = ctor;
    }


    async create(item: T): Promise<string> {
        // beacuse item can be of type any, we need to create a new T() using this.ctor
        let newItem: T = new this.ctor();
        newItem.update(item);
        
        newItem.id = (this._itemsCounter++).toString();

        this._items.set(newItem.id, newItem);

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