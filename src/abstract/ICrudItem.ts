import { ICrudCollection } from "./ICrudCollection";

export interface ICrudItem{
    id: string;

    read(): Promise<any>;    
    update(item: any): Promise<any>;

    /**
     * TODO: Important - collection name param must be equal to url collection name
     * 
     * @param {string} collectionName 
     * @returns {ICrudCollection} 
     * @memberof ICrudItem
     */
    getCollection(collectionName: string): ICrudCollection;
}