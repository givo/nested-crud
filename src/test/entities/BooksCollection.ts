import { ItemsManager } from "../../helpers/ItemsManager";
import { Book } from "./Book";

export class BooksCollection extends ItemsManager<Book>{    
    public async create(item: Book): Promise<string> {
        let newBook = new Book();        
        newBook.update(item);
        newBook.id = (this._itemsCounter++).toString();

        this._items.set(newBook.id, newBook);

        return newBook.id;
    }
}