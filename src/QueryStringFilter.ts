import { IFilterParam } from "./abstract/IFilterParam";
import * as express from 'express';

export function queryFilter(req: express.Request): Array<IFilterParam> {
    // TODO: parse filter
    return [];
}
