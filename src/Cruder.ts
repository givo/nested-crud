import * as express from 'express';
import { Router } from 'express';
import * as HttpStatus from 'http-status-codes';
import { ICrudCollection } from './abstract/ICrudCollection';
import { IDescriptor } from './abstract/IDescriptor';
import { ICrudItem } from './abstract/ICrudItem';
import { queryFilter } from './QueryStringFilter';
import { IFilterParam } from './abstract/IFilterParam';


export class Cruder {

    private _parentCollections: Map<string, ICrudCollection>;

    constructor() {
        this._parentCollections = new Map<string, ICrudCollection>();
    }

    public singleTone(url: string, singleTone: ICrudItem) {

    }

    public parentCollection(route: string, collection: ICrudCollection) {
        this._parentCollections.set(route, collection);
    }

    public listen(url: string): express.Router {
        let router: express.Router = express.Router();
        let parentCollection: ICrudCollection;
        let urlSplit = url.split('/');
        let paramId: string;

        // validate url
        if (urlSplit.length < 2) {
            throw `${url} - bad format, url is needed at least one '/'`;
        }        
        if (!this._parentCollections.has(urlSplit[1])) {
            throw `${url} - must register ${urlSplit[1]} before registering any sub collections`;
        }
        parentCollection = <ICrudCollection>this._parentCollections.get(urlSplit[1]);

        // get name of the item id of the last collection in the url template 
        paramId = urlSplit[urlSplit.length - 1];

        // get all sub collections before every request
        router.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            // append `cruderCollections` member to `req`
            (<any>req).cruderCollections = {};            

            // get each collection from it's parent and add it to `cruderCollections`
            let currentSubCollection: any = parentCollection;
            for (let i = 1; i < urlSplit.length; i += 2) {
                let currentCollectionName: string = urlSplit[i];
                // append current collection to req `req.cruderCollection.'collectionName'`
                (<any>req).cruderCollections[urlSplit[i]] = currentSubCollection;

                if(i + 1 < urlSplit.length){
                    // get item's id 
                    let itemId: string = req.params[urlSplit[i + 1]];                    

                    let item = await currentSubCollection.readById(itemId);
                    if(!item){
                        res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                        res.json({ message: "item doesn't exist"});
                    }

                    // get next sub collection    
                    if(item.getCollection){
                        currentSubCollection = item.getCollection(item);                        
                    }
                }
            }

            // if reached to last collection save as `req.cruderCollection.collection`
            (<any>req).cruderCollections.collection = currentSubCollection;

            next();
        });

        //
        // get all 
        //
        router.get(url.replace(`/${paramId}`, ''), async (req: express.Request, res: express.Response) => {
            let limit: number = 0;
            let filter: Array<IFilterParam>;

            // set limit
            if((<any>req.param).limit){
                limit = (<any>req.param).limit;
            }
            // set filter
            filter = queryFilter(req);

            try {
                let item: Array<IDescriptor> = await (<any>req).cruderCollection.collection.read(limit, filter);
            }
            catch (err) {
                res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                res.json(err);
            }
        });

        //
        // get
        //
        router.get(url, async (req: express.Request, res: express.Response) => {
            let itemId: string = req.params[paramId];

            try {
                let item: IDescriptor = await (<any>req).cruderCollection.collection.readById(itemId);
                res.status(HttpStatus.OK).json(item.describe());
            }
            catch (err) {
                res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                res.json(err);
            }
        });

        //
        // put
        //
        router.put(url, async (req: express.Request, res: express.Response) => {
            let itemId: string = req.params[paramId];
            let item: any = req.body;

            try {
                let updatedItem: IDescriptor = await (<any>req).cruderCollection.collection.update(itemId, item);
                res.send(updatedItem.describe());
            }
            catch (err) {
                res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                res.json(err)
            }
        });

        //
        // post
        //
        router.post(url, async (req: express.Request, res: express.Response) => {
            let item: any = req.body;

            try {
                let id: string = await (<any>req).cruderCollection.collection.create(item);
                res.json({ id: id });
            }
            catch (err) {
                res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                res.json(err);
            };
        });

        //
        // deleteById
        //
        router.delete(url, async (req: express.Request, res: express.Response) => {
            let id: string = req.params[paramId];

            try {
                let deletedItem = await (<any>req).cruderCollection.collection.delete(id);
                res.json(deletedItem);
            }
            catch (err) {
                res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                res.json(err);
            };
        });

        //
        // delete
        //
        router.delete(url, async (req: express.Request, res: express.Response) => {
            let limit: number = 0;
            let filter: Array<IFilterParam>;

            // set limit
            if((<any>req.param).limit){
                limit = (<any>req.param).limit;
            }
            // set filter
            filter = queryFilter(req);

            try {
                let deletedItem = await (<any>req).cruderCollection.collection.delete(limit, filter);
                res.json(deletedItem);
            }
            catch (err) {
                res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                res.json(err);
            };
        });

        return router;
    }
}