import { IODataQuery } from './index.d';

interface IODataPEG {
	parse: (x: string) => Partial<IODataQuery>;
	SyntaxError: (message: string, expected: any, found: any, location: any) => void;
}

const odataParser = require('./odata-parser') as IODataPEG;

export const parse = odataParser.parse;
