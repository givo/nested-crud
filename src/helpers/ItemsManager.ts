import { ICrudCollection, ICrudItem } from "../index";

export abstract class ItemsManager<T extends ICrudItem> implements ICrudCollection<T>{        
    protected _itemsCounter = 0;
    public _items: Map<string, T>;    

    /**
     * Creates an instance of ItemsManager.
     * 
     * @param {(new () => T)} ctor Constructor of T, in order to create a new T on create()
     * @memberof ItemsManager
     */
    constructor(){                
        this._items = new Map<string, T>();        
    }

    abstract async create(item: T): Promise<string>;

    async readMany(limit?: number | undefined, filter?: any | undefined): Promise<T[]> {
        let items: any[] = new Array<any>();

        this._items.forEach((item: T, id: string) => {
            items.push(item);
        });

        return items;
    }

    async readById(id: string): Promise<T> {
        return <T>this._items.get(id);
    }

    async updateMany(fields: any, limit?: number | undefined, filter?: any | undefined): Promise<number> {        
        this._items.forEach((item, id) => {
            item.update(fields);
        });

        return this._items.size;
    }

    async updateById(id: string, fields: any): Promise<T> {
        let item = <T>this._items.get(id);

        if(item){
            item.update(fields);
        }

        return item;
    }

    async deleteById(id: string): Promise<T> {
        let item = <T>this._items.get(id);

        if(item){
            this._items.delete(id);
        }

        return item;
    }

    async deleteMany(limit?: number, filter?: any): Promise<number> {
        let size = this._items.size;

        this._items.clear();

        return size;
    }

    public describe(): Array<any> {
        let items = Array<any>();

        this._items.forEach((item, id) => {
            items.push(item.describe());
        });

        return items;
    }
}