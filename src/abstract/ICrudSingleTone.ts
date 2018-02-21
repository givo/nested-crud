export interface ICrudSingleTone{
    read(): Promise<any>;    
    update(item: any): Promise<number>;
}