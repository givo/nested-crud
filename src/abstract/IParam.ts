import { FilterOperators } from "./FilterOperators";

export interface IParam{
    fieldName: string;
    value: any;
    operator: FilterOperators;
}