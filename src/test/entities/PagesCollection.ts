import { ItemsManager } from "../../helpers/ItemsManager";
import { Page } from "./Page";

export class PagesCollection extends ItemsManager<Page>{
    async create(item: Page): Promise<string> {
        let newPage = new Page();
        newPage.update(item);
        newPage.id = (this._itemsCounter++).toString();

        this._items.set(newPage.id, newPage);

        return newPage.id;
    }
}