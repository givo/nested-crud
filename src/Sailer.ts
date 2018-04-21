import * as express from 'express';
import * as HttpStatus from 'http-status-codes';
import { ICrudCollection } from './abstract/ICrudCollection';
import { IDescriptor } from './abstract/IDescriptor';
import { ICrudItem } from './abstract/ICrudItem';
import { queryFilter } from './QueryStringFilter';
import { IParam } from './abstract/IParam';
import * as bodyParser from 'body-parser';


export class Sailer {
    public static readonly DefaultLimit: number = 100;

    private _parentCollections: Map<string, ICrudCollection>;

    constructor() {
        this._parentCollections = new Map<string, ICrudCollection>();
    }

    public singleTone(url: string, singleTone: ICrudItem): express.Router {
        let router: express.Router = express.Router();

        router.use(bodyParser.json());

        //
        // get
        //
        router.get(url, (req: express.Request, res: express.Response) =>{
            try {                
                res.json(singleTone.describe());
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
            try{
                let item: any = req.body;
                let updated = await singleTone.update(item);
                res.json(updated.describe());
            }
            catch(err){
                res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                res.json(err);
            }
        });

        return router;
    }

    private async travelUrl(url: string, req: express.Request, parentCollection: ICrudCollection) {        
        let startIdx = 1;
        let urlSplit = url.split('/');

        let currentSubCollection: any = parentCollection;

        // append `sailer` member to `req`
        if (!(<any>req).sailer) {
            (<any>req).sailer = {};
        }
        // when the url with :itemId was caught it means the route to url with only /collection was caught first, so a travel was already taken place
        else {
            currentSubCollection = (<any>req).sailer.lastCollection.collection;
            startIdx = (<any>req).sailer.lastCollection.index;
        }

        // get each collection from it's parent and add it to `sailerCollections`
        let currentItem: any;   
        let i: number;     
        for (i = startIdx; i < urlSplit.length; i += 2) {
            // append current collection to `req.sailer`
            let currentCollectionName: string = urlSplit[i];
            (<any>req).sailer[urlSplit[i]] = {index: i, collection: currentSubCollection };

            // if `itemId` is provided in the url get the item
            let itemId: string = urlSplit[i + 1];
            if (itemId) {
                itemId = req.params[itemId.replace(':', '')];

                currentItem = await currentSubCollection.readById(itemId);
                if (!currentItem) {
                    throw { message: "item doesn't exist" };
                }

                // prepare next iteration only if the item has collections    
                if (currentItem.getCollection && i + 2 < urlSplit.length) {
                    currentSubCollection = currentItem.getCollection(urlSplit[i + 2]);
                    if (!currentSubCollection) {
                        throw { message: `cannot find collection ${urlSplit[i + 2]} in ${urlSplit[i]}/${urlSplit[i + 1]}` };
                    }
                }
            }
        }

        // save the desired item and the last collection in `req.sailer`
        (<any>req).sailer.lastCollection = { index: i - 2, collection: currentSubCollection };
        (<any>req).sailer.lastItem = currentItem;
    }

    public collection(url: string, parentCollection?: ICrudCollection): express.Router {
        let router: express.Router = express.Router();
        let urlSplit = url.split('/');
        let paramId: string;

        let self = this;

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

        // get the url of the last collection
        let collectionUrl: string = url.replace(`/:${paramId}`, '');

        //
        // get all sub collections and items before every request to the desired collection
        //        
        router.use(collectionUrl, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try{
                await self.travelUrl(collectionUrl, req, <ICrudCollection>parentCollection);
            }
            catch(err){
                res.statusCode = HttpStatus.NOT_FOUND;
                res.json(err);

                return;
            }

            next();
        });

        //
        // get all sub collections and items before every request the desired item
        //
        router.use(url, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try{
                await self.travelUrl(url, req, <ICrudCollection>parentCollection);
            }
            catch(err){
                res.statusCode = HttpStatus.NOT_FOUND;
                res.json(err);

                return;
            }

            next();
        });

        //
        // create
        //
        router.post(collectionUrl, async (req: express.Request, res: express.Response) => {
            let item: any = req.body;

            try {
                let id: string = await (<any>req).sailer.lastCollection.collection.create(item);
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
        router.get(collectionUrl, async (req: express.Request, res: express.Response) => {
            let limit: number = Sailer.DefaultLimit;
            let filter: Array<IParam>;

            // set limit
            if ((<any>req.param).limit) {
                limit = (<any>req.param).limit;
            }
            // set filter
            filter = queryFilter(req);

            try {
                let items: Array<IDescriptor> = await (<any>req).sailer.lastCollection.collection.readMany(limit, filter);
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
                let item: IDescriptor = (<any>req).sailer.lastItem;
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
        router.put(collectionUrl, async (req: express.Request, res: express.Response) => {
            let limit: number = Sailer.DefaultLimit;
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
                let updated: number = await (<any>req).sailer.lastCollection.collection.updateMany(fields, filter, limit);
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
                let updatedItem: IDescriptor = await (<any>req).sailer.lastCollection.collection.updateById(itemId, fields);
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
        router.delete(collectionUrl, async (req: express.Request, res: express.Response) => {
            let limit: number = 0;
            let filter: Array<IParam>;

            // set limit
            if ((<any>req.param).limit) {
                limit = (<any>req.param).limit;
            }
            // set filter
            filter = queryFilter(req);

            try {
                let deleted = await (<any>req).sailer.lastCollection.collection.deleteMany(limit, filter);
                res.json({ count: deleted });
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
                let deletedItem: IDescriptor = await (<any>req).sailer.lastCollection.collection.deleteById(id);
                res.json(deletedItem.describe());
            }
            catch (err) {
                res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
                res.json(err);
            };
        });

        return router;
    }
}