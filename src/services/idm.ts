import Axios from 'axios';
import querystring from 'query-string';
import { envVars, log } from '../config';
import { defaultErrorHandler } from '../utils/httpErrorTranslators';

export interface IAccessTokenDecoded {
    access_token: string;
	/**
	 * Use sub not flid due to sso - see idm
	 */
    flid?: string;
    sub: string | string[];
    client_id: string;
    abs_time_orguser_stage?: string;
    abs_time_campususer_stage?: string;
    abs_time_employee_stage?: string;
    abs_time_orguser?: string;
    abs_time_campususer?: string;
    abs_time_employee?: string;
    employee?: string;
    role?: string | string[];
    organizationid?: string | string[];
}

/**
 * Decode an access token
 */
export const decodeAccessToken = async (accessToken: string, correlationId: string): Promise<IAccessTokenDecoded> => {
    log.trace(
        `About to hit the accesstokenvalidation endpoint with accessToken ${accessToken} and correlationId of ${correlationId}`,
    );
    const urlMinusBase = '/connect/accesstokenvalidation';
    const response = await Axios.get<IAccessTokenDecoded>(`${envVars.get('ID_GATEWAY_URL')}${urlMinusBase}`, {
        params: {
            token: accessToken,
        },
    }).catch(err => {
        // tslint:disable-next-line:no-unsafe-any // Note: tslint has a longstanding bug regarding err being considered any
        return defaultErrorHandler(err, {
            // You don't normally have to do this since myHttpClient does this in other places, but here we don't use that because we need to go raw
            correlationId,
            serviceName: 'decodeAccessToken',
            url: urlMinusBase,
        });
    });
    log.trace(response.data);
    return response.data;
};

interface IAppToAppAccessToken {
    access_token: string;
	/**
	 * you'll never have a subject id because this is an application to application authorization
	 */
    sub?: never;
    expires_in: number;
    token_type: string;
}

export interface IClientCredentialsTokenRequestInfo {
    client_id: string;
    client_secret: string;
    scope: string;
    grant_type: 'client_credentials';
}

/**
 * Get an access token
 */
export const getClientCredentialsToken = async (opts: {
    correlationId: string;
    bodyOfReq: IClientCredentialsTokenRequestInfo;
}): Promise<IAppToAppAccessToken> => {
    const urlMinusBase = '/connect/token';
    const fullUrl = `${envVars.get('ID_GATEWAY_URL')}${urlMinusBase}`;
    log.trace(`About to hit the ${fullUrl} endpoint`);

    const formEncodedBody = querystring.stringify(opts.bodyOfReq);

    const response = await Axios.post<IAppToAppAccessToken>(fullUrl, formEncodedBody, {
        headers: {
            'X-FL-Hop-CorrelationId': opts.correlationId,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    }).catch(err => {
        // tslint:disable-next-line:no-unsafe-any // Note: tslint has a longstanding bug regarding err being considered any
        return defaultErrorHandler(err, {
            // You don't normally have to do this since myHttpClient does this in other places, but here we don't use that because we need to go raw
            correlationId: opts.correlationId,
            serviceName: 'decodeAccessToken',
            url: urlMinusBase,
        });
    });
    log.trace(response.data);
    return response.data;
};