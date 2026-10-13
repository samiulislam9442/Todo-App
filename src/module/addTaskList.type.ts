
export type IData = {
    id: string | number;
    task: string;
    category: string;
    isDone: boolean;
}

export type ILocalStorage = {
    data: IData[];
}
