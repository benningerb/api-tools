interface IParserError {
    error: string;
}

interface IOrderByOutput {
    type: 'asc' | 'desc';
    name: string;
}

type FilterOperator = 'eq' | 'ne' | 'lt' | 'le' | 'gt' | 'ge';

interface IFilterLeftOperand {
    type: 'property';
    name: string;
}
interface IFilterRightOperand {
    type: 'literal';
    value: string | number | boolean;
}

interface IFilterOutput {
    type: FilterOperator;
    left: IFilterLeftOperand;
    right: IFilterRightOperand;
}

export interface IODataQuery {
    $callback: string | IParserError;
    $count: boolean | IParserError;
    $filter: IFilterOutput | IParserError;
    $format: string | IParserError;
    $maxpagesize: number | IParserError;
    $orderby: IOrderByOutput | IParserError;
    $select: string[] | IParserError;
    $skip: number | IParserError;
    $top: number | IParserError;
    [$unsupported: string]: unknown;
}
