import { IDescriptor } from "./IDescriptor";

export interface ICrudCollection {
    get(): Promise<Array<IDescriptor>>;

    /**
     * 
     * 
     * @param {*} item 
     * @returns {Promise<string>} The id of the created item
     * @memberof ICrudCollection
     */
    create(item: any): Promise<string>;

    /**
     * 
     * 
     * @param {string} id 
     * @returns {Promise<IDescriptor>} 
     * @memberof ICrudCollection
     */
    readById(id: string): Promise<IDescriptor>;

    /**
     * 
     * 
     * @param {string} id 
     * @param {*} item 
     * @returns {Promise<IDescriptor>} The updated item
     * @memberof ICrudCollection
     */
    update(id: string, item: any): Promise<IDescriptor>;      

    /**
     * 
     * 
     * @param {string} id 
     * @returns {Promise<IDescriptor>} The deleted item
     * @memberof ICrudCollection
     */
    delete(id: string): Promise<IDescriptor>;
}