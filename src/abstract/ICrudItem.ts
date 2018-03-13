import { ICrudCollection } from "./ICrudCollection";
import { IDescriptor } from "./IDescriptor";

export interface ICrudItem extends IDescriptor{
    id: string;

    read(): Promise<any>;
    update(item: any): Promise<IDescriptor>;

    /**
     * TODO: Important - collection name param must be equal to url collection name
     * 
     * @param {string} collectionName 
     * @returns {ICrudCollection} 
     * @memberof ICrudItem
     */
    getCollection(collectionName: string): ICrudCollection | undefined;
}