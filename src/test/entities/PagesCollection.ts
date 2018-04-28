import { ItemsManager } from "../../helpers/ItemsManager";
import { Page } from "./Page";

export class PagesCollection extends ItemsManager<Page>{
    async create(item: any): Promise<string> {
        let newPage = new Page((this._itemsCounter++).toString(), item.number, item.content);

        this._items.set(newPage.id, newPage);

        return newPage.id;
    }
}