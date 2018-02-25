import { IFilterParam, IDescriptor, FilterOperators, ICrudCollection } from '../src/index';
import { User } from './User';

export class UsersManager implements ICrudCollection{    
    private static UsersId = 0;

    private _users: Map<string, User>;

    constructor(){
        this._users = new Map<string, User>();
    }

    async create(item: any): Promise<string> {
        this._users.set((UsersManager.UsersId++).toString(), item);

        return (UsersManager.UsersId++).toString();
    }

    // return all
    async readMany(limit?: number, filter?: IFilterParam[]): Promise<IDescriptor[]> {
        let users = new Array<User>();

        this._users.forEach((user, userId) => {
            users.push(user.describe());
        });

        return users;
    }

    async readById(id: string): Promise<IDescriptor> {
        return <User>this._users.get(id);
    }

    // update all
    async updateMany(fields: IFilterParam[], limit?: number, filter?: IFilterParam[]): Promise<number> {
        let updateCount = 0;

        this._users.forEach((user, userId) => {
            user.update(fields);
            updateCount++;
        });

        return updateCount;
    }

    async updateById(id: string, item: any): Promise<any> {
        let user = <User>this._users.get(id);

        if(user){            
            user.update(item);            
        }

        return user;
    }

    async deleteById(id: string): Promise<number> {
        let deleted = 0;

        deleted = + this._users.delete(id);

        return deleted;
    }

    async delete(filter: any, limit: number): Promise<number> {
        let deleted = this._users.size;
        
        this._users.clear();

        return deleted;
    }    
}