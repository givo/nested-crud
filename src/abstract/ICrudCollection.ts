import { IDescriptor } from "./IDescriptor";
import { ICrudItem } from "..";

export interface ICrudCollection<T extends ICrudItem> extends IDescriptor {
    /**
     * Create a single item
     * 
     * @param {*} fields 
     * @returns {Promise<string>} The id of the created item
     * @memberof ICrudCollection
     */
    create(fields: any): Promise<string>;

    /**
     * Returns all the items who match the specified `filter` and limits the number of returned item to `limit`.
     * 
     * @param {number} [limit] 
     * @param {any} [filter] 
     * @returns {Promise<Array<T>>} 
     * @memberof ICrudCollection
     */
    readMany(limit?: number, filter?: any): Promise<Array<T>>;

    /**
     * Returns the item that is represented by the specified `id`.
     * 
     * @param {string} id 
     * @returns {Promise<T>} 
     * @memberof ICrudCollection
     */
    readById(id: string): Promise<T>;

    /**
     * Updates all the items who match the given filter
     * 
     * @param {Array<IParam>} fields The fields to update
     * @param {number} [limit] 
     * @param {any} [filter] 
     * @returns {Promise<number>} 
     * @memberof ICrudCollection
     */
    updateMany(fields: any, limit?: number, filter?: any): Promise<number>;

    /**
     * Updates the item represeted by the specified `id`.
     * 
     * @param {string} id 
     * @param {*} fields The fields to update
     * @returns {Promise<T>} The updated item
     * @memberof ICrudCollection
     */
    updateById(id: string, fields: any): Promise<T>;

    /**
     * Deletes the item represeted by the specified `id`
     * 
     * @param {string} id the id of the desired item to be delted
     * @returns {Promise<number>} `1` if the item was deleted, otherwise `0`
     * @memberof ICrudCollection
     */
    deleteById(id: string): Promise<T>;

    /**
     * Deletes all the items who the match the specified `filter` and the limits the deletion to `limit` items.
     * 
     * @param {number} limit 
     * @param {any} filter 
     * @returns {Promise<any>} The deleted item
     * @memberof ICrudCollection
     */
    deleteMany(limit?: number, filter?: any): Promise<number>;
}