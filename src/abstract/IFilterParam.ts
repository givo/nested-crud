import { FilterOperators } from "./FilterOperators";

export interface IFilterParam{
    fieldName: string;
    operator: FilterOperators;
    value: any;
}