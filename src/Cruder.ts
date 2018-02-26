import * as express from 'express';
import { Router } from 'express';
import * as HttpStatus from 'http-status-codes';
import { ICrudCollection } from './abstract/ICrudCollection';
import { IDescriptor } from './abstract/IDescriptor';
import { ICrudItem } from './abstract/ICrudItem';
import { queryFilter } from './QueryStringFilter';
import { IParam } from './abstract/IParam';
import * as bodyParser from 'body-parser';


export class Cruder {
    public static readonly DefaultLimit: number = 100;

    private _parentCollections: Map<string, ICrudCollection>;

    constructor() {
        this._parentCollections = new Map<string, ICrudCollection>();
    }

    public singleTone(url: string, singleTone: ICrudItem) {

    }

    public listen(url: string, parentCollection?: ICrudCollection): express.Router {
        let router: express.Router = express.Router();
        let urlSplit = url.split('/');
        let paramId: string;

        // validate url
        if (urlSplit.length < 2) {
            throw `${url} - bad format, url is needed at least one '/'`;
        }

        // register parent collection
        if (!this._parentCollections.has(urlSplit[1])) {
            if (parentCollection) {
                this._parentCollections.set(url.replace('/', ''), parentCollection);
            }
            else {
                throw `${url} - must call listen() with \`parentCollection\` on the first time`;
            }
        }

        router.use(bodyParser.json());

        // get name of the item id of the last collection in the url template 
        paramId = urlSplit[urlSplit.length - 1].replace(':', '');

        //
        // add `parentCollection` to req.cruder on requests to root path
        //
        router.use(`/${urlSplit[1]}`, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            (<any>req).cruder = {};
            (<any>req).cruder[urlSplit[1]] = parentCollection;
            (<any>req).cruder.lastCollection = parentCollection;

            next();
        });

        //
        // get all sub collections before every request
        //
        router.use(url, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            // append `cruderCollections` member to `req`
            (<any>req).cruder = {};

            // get each collection from it's parent and add it to `cruderCollections`
            let currentSubCollection: any = parentCollection;
            let currentItem: any;
            for (let i = 1; i < urlSplit.length; i += 2) {
                // append current collection to `req.cruder`
                let currentCollectionName: string = urlSplit[i];
                (<any>req).cruder[urlSplit[i]] = currentSubCollection;

                // if(i + 1 < urlSplit.length){

                // if `itemId` is provided get the item
                let itemId: string = req.params[urlSplit[i + 1].replace(':', '')];
                if (itemId) {
                    currentItem = await currentSubCollection.readById(itemId);
                    if (!currentItem) {
                        res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                        res.json({ message: "item doesn't exist" });
                        return;
                    }

                    // prepare next iteration only if the item has collections    
                    if (currentItem.getCollection) {
                        currentSubCollection = currentItem.getCollection(currentItem);
                    }
                }

                // }
            }

            // save the desired item and the last collection in `req.cruder`
            (<any>req).cruder.lastCollection = currentSubCollection;
            (<any>req).cruder.lastItem = currentItem;

            next();
        });

        //
        // create
        //
        router.post(url, async (req: express.Request, res: express.Response) => {
            let item: any = req.body;

            try {
                let id: string = await (<any>req).cruder.lastCollection.create(item);
                res.json({ id: id });
            }
            catch (err) {
                res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                res.json(err);
            };
        });

        //
        // read many 
        // 
        router.get(url.replace(`/:${paramId}`, ''), async (req: express.Request, res: express.Response) => {
            let limit: number = Cruder.DefaultLimit;
            let filter: Array<IParam>;

            // set limit
            if ((<any>req.param).limit) {
                limit = (<any>req.param).limit;
            }
            // set filter
            filter = queryFilter(req);

            try {
                let items: Array<IDescriptor> = await (<any>req).cruder.lastCollection.readMany(limit, filter);
                res.json(items.map((item, i) => {
                    return item.describe();
                }));
            }
            catch (err) {
                res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                res.json(err);
            }
        });

        //
        // read by id
        //
        router.get(url, (req: express.Request, res: express.Response) => {
            try {
                let item: IDescriptor = (<any>req).cruder.lastItem;
                res.json(item.describe());
            }
            catch (err) {
                res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                res.json(err);
            }
        });

        //
        // update many
        //
        router.put(url.replace(`/:${paramId}`, ''), async (req: express.Request, res: express.Response) => {
            let limit: number = Cruder.DefaultLimit;
            let filter: Array<IParam>;
            let fields: Array<IParam>;            // TODO: take fields from req

            // get limit
            if ((<any>req.param).limit) {
                limit = (<any>req.param).limit;
            }
            // get filter
            filter = queryFilter(req);
            // get fields
            fields = req.body;

            try {
                let updated: number = await (<any>req).cruder.lastCollection.updateMany(fields, filter, limit);
                res.json({ count: updated });
            }
            catch (err) {
                res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                res.json(err)
            }
        });

        //
        // update by id
        //
        router.put(url, async (req: express.Request, res: express.Response) => {            
            let fields: any = req.body;
            let itemId: string = req.params[paramId];

            try {
                let updatedItem: IDescriptor = await (<any>req).cruder.lastCollection.updateById(itemId, fields);
                res.json(updatedItem.describe());
            }
            catch (err) {
                res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                res.json(err)
            }
        });

        //
        // delete many
        //
        router.delete(url.replace(`/:${paramId}`, ''), async (req: express.Request, res: express.Response) => {
            let limit: number = 0;
            let filter: Array<IParam>;

            // set limit
            if ((<any>req.param).limit) {
                limit = (<any>req.param).limit;
            }
            // set filter
            filter = queryFilter(req);

            try {
                let deletedItem = await (<any>req).cruder.lastCollection.delete(limit, filter);
                res.json(deletedItem);
            }
            catch (err) {
                res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                res.json(err);
            };
        });

        //
        // delete by id
        //
        router.delete(url, async (req: express.Request, res: express.Response) => {
            let id: string = req.params[paramId];

            try {
                let deletedItem = await (<any>req).cruder.lastCollection.delete(id);
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