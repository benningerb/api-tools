import { IODataQuery } from './index.d';

interface IErrorLocation {
	offset: number;
	line: number;
	column: number;
}

interface IODataPEG {
	parse: (x: string) => Partial<IODataQuery>;
	SyntaxError: (message: string, expected: any, found: any, location: { start: IErrorLocation, end: IErrorLocation }) => void; // tslint:disable-line:no-any
}

const odataParser = require('./odata-parser') as IODataPEG;

export const parse = odataParser.parse;
