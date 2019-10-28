import { ensureBearerToken } from './middleware/authorization';
import { parseOData } from './middleware/parse-odata';
import { requestId } from './middleware/request-id';
import { responseTime } from './middleware/response-time';

export default {
	config: {},
	middleware: {
		ensureBearerToken,
		parseOData,
		requestId,
		responseTime,
	},
	util: {},
};
