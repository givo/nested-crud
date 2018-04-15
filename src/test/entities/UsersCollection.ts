import { ItemsManager } from "../../helpers/ItemsManager";
import { User } from "./User";

export class UsersCollection extends ItemsManager<User>{
    public async create(item: User): Promise<string> {
        let newUser = new User(item.name);
        newUser.update(item);
        newUser.id = (this._itemsCounter++).toString();

        this._items.set(newUser.id, newUser);

        return newUser.id;
    }
}