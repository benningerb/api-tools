import { ensureBearerToken } from './middleware/authorization';
import { requestId } from './middleware/request-id';
import { responseTime } from './middleware/response-time';

export default {
	config: {},
	middleware: {
		ensureBearerToken,
		requestId,
		responseTime,
	},
	util: {},
};
