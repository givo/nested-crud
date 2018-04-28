import { ItemsManager } from "../../helpers/ItemsManager";
import { User } from "./User";

export class UsersCollection extends ItemsManager<User>{
    public async create(item: any): Promise<string> {
        let newUser = new User((this._itemsCounter++).toString(), item.name, item.height);

        this._items.set(newUser.id, newUser);

        return newUser.id;
    }
}