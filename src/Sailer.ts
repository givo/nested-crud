import * as express from 'express';
import * as HttpStatus from 'http-status-codes';
import { ICrudCollection } from './abstract/ICrudCollection';
import { ICrudItem } from './abstract/ICrudItem';
import * as bodyParser from 'body-parser';
import { FilterOperators } from './abstract/FilterOperators';

/**
 * Represents an instance which creates express routers for RESTful single tones and collections.
 * 
 * @export
 * @class Sailer
 */
export class Sailer {
    public static readonly DefaultLimit: number = 100;

    private _parentCollections: Map<string, ICrudCollection<ICrudItem>>;


    constructor() {
        this._parentCollections = new Map<string, ICrudCollection<ICrudItem>>();
    }

    /**
     * Creates a single tone route.
     * 
     * @param {string} url A url template without route parameters
     * @param {ICrudItem} singleTone The single tone resource 
     * @returns {express.Router} 
     * @memberof Sailer
     */
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

    /**
     * Iterates over the request's url and get all the collections and items in the path. 
     * 
     * @private
     * @param {string} url 
     * @param {express.Request} req 
     * @param {ICrudCollection} parentCollection 
     * @memberof Sailer
     */
    private async travelUrl(url: string, req: express.Request, parentCollection: ICrudCollection<ICrudItem>) {        
        let startIdx = 1;
        let urlSplit = url.split('/');

        let currentSubCollection: any = parentCollection;

        // append `sailer` member to `req` on first run
        if (!(<any>req).sailer) {
            (<any>req).sailer = {};
        }
        // get the last collection of the last iteration
        // (when a url with /:itemId at the end was caught it means a route with only /collection at the end was caught first,
        // therefore a travel was already taken place)
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

    /**
     * Creates a collection resource route.
     * 
     * @param {string} url A url template with route parameters
     * @param {ICrudCollection} [parentCollection]  The resource collection
     * @returns {express.Router} 
     * @memberof Sailer
     */
    public collection(url: string, parentCollection?: ICrudCollection<ICrudItem>): express.Router {
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
                await self.travelUrl(collectionUrl, req, <ICrudCollection<ICrudItem>>parentCollection);
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
                await self.travelUrl(url, req, <ICrudCollection<ICrudItem>>parentCollection);
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
            let filter: any;

            // set limit
            if (req.query.limit) {
                limit = req.query.limit;
            }
            // set filter
            if(req.query.filter){
                filter = JSON.parse(req.query.filter);
            }

            try {
                let items: Array<ICrudItem> = await (<any>req).sailer.lastCollection.collection.readMany(limit, filter);
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
                let item: ICrudItem = (<any>req).sailer.lastItem;
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
            let filter: any;
            let fields: any;            // TODO: take fields from req

            // get limit
            if (req.body.limit) {
                limit = req.body.limit;
            }
            // get filter
            if(req.body.filter){
                filter = req.body.filter;
            }
            // get fields
            if(req.body.fields){
                fields = req.body.fields;
            }

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
            let fields: any = req.body.fields;
            let itemId: string = req.params[paramId];

            try {
                let updatedItem: ICrudItem = await (<any>req).sailer.lastCollection.collection.updateById(itemId, fields);
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
            let filter: any;

            // get limit
            if (req.body.limit) {
                limit = req.body.limit;
            }
            // get filter
            if(req.body.filter){
                filter = req.body.filter;
            }

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
                let deletedItem: ICrudItem = await (<any>req).sailer.lastCollection.collection.deleteById(id);
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