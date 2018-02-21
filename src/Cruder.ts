import * as express from 'express';
import { Router } from 'express';
import * as HttpStatus from 'http-status-codes';
import { ICrudCollection } from './abstract/ICrudCollection';
import { IDescriptor } from './abstract/IDescriptor';
import { ICrudSingleTone } from './abstract/ICrudSingleTone';

export class Cruder {

    private _parentCollections: Map<string, ICrudCollection>;

    constructor() {
        this._parentCollections = new Map<string, ICrudCollection>();
    }

    public singleTone(url: string, singleTone: ICrudSingleTone) {

    }

    public collection(url: string): express.Router {
        let router: express.Router = express.Router();
        // let url = `${url}/:${paramId}`;
        let parentCollection: ICrudCollection;
        let urlSplit = url.split('/');
        let paramId: string;

        // validate url
        if (urlSplit.length < 3 || urlSplit.length % 2 == 0) {
            throw `${url} - bad format, missing '/'`;
        }
        if (!urlSplit[urlSplit.length - 1].includes(':')) {
            throw `${url} - bad format, ':' is missing`;
        }
        if (!this._parentCollections.has(urlSplit[1])) {
            throw `${url} - must register ${urlSplit[1]} before registering any sub collections`;
        }
        parentCollection = <ICrudCollection>this._parentCollections.get(urlSplit[1]);

        // get id of the last collection in the url template 
        paramId = urlSplit[urlSplit.length - 1];

        // get all sub collections before every request
        router.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {            
            // append `cruderCollections` member to `req`
            (<any>req).cruderCollections = {};

            // get each collection from it's parent and add it to `cruderCollections`
            let currentSubCollection: any = parentCollection;
            for (let i = 2; i < urlSplit.length; i += 2) {
                // get item's id 
                let itemId: string = req.params[urlSplit[i + 1]];      

                // get sub collection
                currentSubCollection = await currentSubCollection.readById(itemId);
                if(!(<ICrudCollection>currentSubCollection)){
                    throw `${urlSplit[2]} is not of type 'ICrudCollection'`;
                }

                // if reached to last collection save as `req.cruderCollection.collection`
                (<any>req).cruderCollections[urlSplit[i]] = currentSubCollection;
                if(i == urlSplit.length - 2){
                    (<any>req).cruderCollections.collection = currentSubCollection;
                }
            }

            next();
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
        // delete
        //
        router.delete(url, async (req: express.Request, res: express.Response) => {
            let id: string = req.params[paramId];

            res.statusCode = HttpStatus.OK;

            try {
                let deletedItem = (<any>req).cruderCollection.collection.delete(id);
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