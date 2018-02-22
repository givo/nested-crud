import { ICrudCollection } from "./ICrudCollection";

export interface ICrudItem{
    read(): Promise<any>;    
    update(item: any): Promise<number>;
    getCollection(collectionName: string): ICrudCollection;
}