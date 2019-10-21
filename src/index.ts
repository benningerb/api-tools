import { requestId } from './middleware/request-id';
import { responseTime } from './middleware/response-time';

export default {
	config: {},
	middleware: {
		requestId,
		responseTime,
	},
	util: {},
};
