import { ItemsManager } from "../../helpers/ItemsManager";
import { Book } from "./Book";

export class BooksCollection extends ItemsManager<Book>{    
    public async create(item: any): Promise<string> {
        let newBook = new Book((this._itemsCounter++).toString(), item.name);

        this._items.set(newBook.id, newBook);

        return newBook.id;
    }
}