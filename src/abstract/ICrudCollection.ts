import { IDescriptor } from "./IDescriptor";
import { IParam } from "./IParam";

export interface ICrudCollection extends IDescriptor {
    /**
     * Create a single item
     * 
     * @param {*} item 
     * @returns {Promise<string>} The id of the created item
     * @memberof ICrudCollection
     */
    create(item: any): Promise<string>;

    /**
     * Returns all the items who match the specified `filter` and limits the number of returned item to `limit`.
     * 
     * @param {number} [limit] 
     * @param {Array<IParam>} [filter] 
     * @returns {Promise<Array<IDescriptor>>} 
     * @memberof ICrudCollection
     */
    readMany(limit?: number, filter?: Array<IParam>): Promise<Array<IDescriptor>>;

    /**
     * Returns the item that is represented by the specified `id`.
     * 
     * @param {string} id 
     * @returns {Promise<IDescriptor>} 
     * @memberof ICrudCollection
     */
    readById(id: string): Promise<IDescriptor>;

    /**
     * Updates all the items who match the given filter
     * 
     * @param {Array<IParam>} fields The fields to update
     * @param {number} [limit] 
     * @param {Array<IParam>} [filter] 
     * @returns {Promise<number>} 
     * @memberof ICrudCollection
     */
    updateMany(fields: any, limit?: number, filter?: Array<IParam>): Promise<number>;

    /**
     * Updates the item represeted by the specified `id`.
     * 
     * @param {string} id 
     * @param {*} fields The fields to update
     * @returns {Promise<IDescriptor>} The updated item
     * @memberof ICrudCollection
     */
    updateById(id: string, fields: any): Promise<IDescriptor>;

    /**
     * Deletes the item represeted by the specified `id`
     * 
     * @param {string} id the id of the desired item to be delted
     * @returns {Promise<number>} `1` if the item was deleted, otherwise `0`
     * @memberof ICrudCollection
     */
    deleteById(id: string): Promise<IDescriptor>;

    /**
     * Deletes all the items who the match the specified `filter` and the limits the deletion to `limit` items.
     * 
     * @param {number} limit 
     * @param {Array<IParam>} filter 
     * @returns {Promise<any>} The deleted item
     * @memberof ICrudCollection
     */
    deleteMany(limit: number, filter: Array<IParam>): Promise<number>;
}