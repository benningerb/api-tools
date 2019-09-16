import { AxiosRequestConfig } from 'axios';
export interface IRequestOptions {
    /** The requestConfig options object that Axios can be sent */
    requestConfig?: AxiosRequestConfig;
    /** a GUID used to combine multiple logs from various services together in the logs */
    correlationId: string;
    /** used for logging purposes, this is the name of the service that you are sending the request to */
    serviceName?: string;
    url: string;
    /** the request body payload that you will be sending to the server */
    body?: unknown;
}