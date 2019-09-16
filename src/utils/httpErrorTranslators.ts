import httpStatusCodes from 'http-status-codes';
import createHttpError from 'http-errors';
import { AxiosError, AxiosResponse } from 'axios';
import { IRequestOptions } from './IRequestOptions';
import { firstOrNull } from './genericTypes';
import util from 'util';
import { assertUnreachable } from './assertUnreachable';
import { defaultLogger as logger } from '../utils/logger';

interface ISimpleErrorString {
    error: string;
}

function isISimpleErrorString(testObj: unknown & object): testObj is ISimpleErrorString {
    const typeSafeTestObj: Partial<ISimpleErrorString> = testObj;
    if (typeSafeTestObj.error && typeof typeSafeTestObj.error === 'string') {
        return true;
    } else {
        return false;
    }
}

interface IErrorBodyWithMessages {
    messages: string[];
}

function isIErrorBodyWithMessages(testObj: unknown & object): testObj is IErrorBodyWithMessages {
    const typeSafeTestObj: Partial<IErrorBodyWithMessages> = testObj;
    if (
        typeSafeTestObj.messages &&
        Array.isArray(typeSafeTestObj.messages) &&
        typeof firstOrNull(typeSafeTestObj.messages) === 'string'
    ) {
        return true;
    } else {
        return false;
    }
}

interface IErrorBodyWithMessagesObjects {
    messages: object[];
}

function isIErrorBodyWithMessageObjects(testObj: unknown & object): testObj is IErrorBodyWithMessagesObjects {
    const typeSafeTestObj: Partial<IErrorBodyWithMessages> = testObj;
    if (
        typeSafeTestObj.messages &&
        Array.isArray(typeSafeTestObj.messages) &&
        typeof firstOrNull(typeSafeTestObj.messages) === 'object'
    ) {
        return true;
    } else {
        return false;
    }
}

interface IIdmGatewayErrorStructure {
    Message: string;
}

function isIIdmGatewayErrorStructure(testObj: unknown & object): testObj is IIdmGatewayErrorStructure {
    const typeSafeTestObj: Partial<IErrorMessageDetail> = testObj;
    if (typeof typeSafeTestObj.Message === 'string' && !typeSafeTestObj.MessageDetail) {
        return true;
    } else {
        return false;
    }
}

interface IErrorMessageDetail {
    Message: string;
    MessageDetail: string;
}

function isErrorMessageDetailObj(testObj: unknown & object): testObj is IErrorMessageDetail {
    const typeSafeTestObj: Partial<IErrorMessageDetail> = testObj;
    if (typeof typeSafeTestObj.Message === 'string' && typeof typeSafeTestObj.MessageDetail === 'string') {
        return true;
    } else {
        return false;
    }
}

interface IOneErrorMessage {
    message: string;
}

function isIOneErrorMessage(testObj: unknown & object): testObj is IOneErrorMessage {
    const typeSafeTestObj: Partial<IOneErrorMessage> = testObj;
    if (typeof typeSafeTestObj.message === 'string') {
        return true;
    } else {
        return false;
    }
}

interface IJsonApiOneError {
    Id: string;
    Title: string;
}

function isObjectAndNotArray(thingToTest: unknown): thingToTest is object {
    if (typeof thingToTest === 'object' && thingToTest !== null && !Array.isArray(thingToTest)) {
        return true;
    }
    return false;
}

function isOneJsonApiError(testObj: unknown): testObj is IJsonApiOneError {
    if (!isObjectAndNotArray(testObj)) {
        return false;
    }
    const typeSafeTestObj: Partial<IJsonApiOneError> = testObj;
    if (typeSafeTestObj && typeof typeSafeTestObj.Id === 'string' && typeof typeSafeTestObj.Title === 'string') {
        return true;
    } else {
        return false;
    }
}

interface IJustOneErrorFromFrontlineCentral {
    data: {
        errors: IJsonApiOneError;
    };
}

interface IManyErrorFromFrontlineCentral {
    data: {
        errors: IJsonApiOneError[];
    };
}

function isOneFrontlineCentralError(testObj: unknown): testObj is IJustOneErrorFromFrontlineCentral {
    if (!isObjectAndNotArray(testObj)) {
        return false;
    }
    const typeSafeTestObj: Partial<IJustOneErrorFromFrontlineCentral> = testObj;
    if (typeSafeTestObj.data && typeSafeTestObj.data.errors && isOneJsonApiError(typeSafeTestObj.data.errors)) {
        return true;
    } else {
        return false;
    }
}

function isManyFrontlineCentralError(testObj: unknown): testObj is IManyErrorFromFrontlineCentral {
    if (!isObjectAndNotArray(testObj)) {
        return false;
    }
    const typeSafeTestObj: Partial<IManyErrorFromFrontlineCentral> = testObj;
    if (
        typeSafeTestObj.data &&
        typeSafeTestObj.data.errors &&
        Array.isArray(typeSafeTestObj.data && typeSafeTestObj.data.errors) &&
        // Frontline Central always serializes at least one error message
        typeSafeTestObj.data &&
        typeSafeTestObj.data.errors.length > 0 &&
        isOneJsonApiError(typeSafeTestObj.data && typeSafeTestObj.data.errors[0])
    ) {
        return true;
    }
    return false;
}

export type IPossibleErrorsFromFLProviders =
    | ISimpleErrorString
    | IErrorBodyWithMessages
    | IErrorBodyWithMessagesObjects
    | IJustOneErrorFromFrontlineCentral
    | IManyErrorFromFrontlineCentral
    | IIdmGatewayErrorStructure
    | IErrorMessageDetail
    | IOneErrorMessage
    | string
    | null;

/*
 * Man oh man. I am not fan of the way that the FC servers communicate errors. This function abstracts away the pain so that it's easier to debug what the issue actually was.
 */
function translateResponseToErrorMessage(
    responseData: IPossibleErrorsFromFLProviders,
    statusCode: number,
    urlThatWasUsed: string | undefined,
): string {
    if (!responseData) {
        return 'No error message specified by the downstream server';
    } else if (typeof responseData === 'string') {
        logger.warn("If you're getting a string back from the server, it's likely that you concatenated a bad url.");
        return responseData;
    } else if (isISimpleErrorString(responseData)) {
        return responseData.error;
    } else if (isIErrorBodyWithMessages(responseData)) {
        return responseData.messages.join(', Another Error: ');
    } else if (isIErrorBodyWithMessageObjects(responseData)) {
        return responseData.messages.map(m => util.format(m)).join(', Another Error: ');
    } else if (isIIdmGatewayErrorStructure(responseData)) {
        return responseData.Message;
    } else if (isErrorMessageDetailObj(responseData)) {
        return `${responseData.Message} with details: ${responseData.MessageDetail}`;
    } else if (isIOneErrorMessage(responseData)) {
        return responseData.message;
    } else if (isOneFrontlineCentralError(responseData)) {
        return responseData.data.errors.Title;
    } else if (isManyFrontlineCentralError(responseData)) {
        return responseData.data.errors.map(x => x.Title).join(', Another Error: ');
    } else {
        logger.warn(`There's an error type that we're not handling. Let's add this: ${util.format(responseData)}`);
        return assertUnreachable(
            responseData,
            `Status code of ${statusCode} but found unexpected error structure came back from ${urlThatWasUsed ||
            'the server'} -->`,
        );
    }
}

export interface IGenericAxiosError<TResponseErrorType> extends AxiosError {
    response?: AxiosResponse<TResponseErrorType>;
}

export const defaultErrorHandler = (
    origErr: IGenericAxiosError<IPossibleErrorsFromFLProviders>,
    requestOptions: IRequestOptions,
): never => {
    const errResponse = origErr && origErr.response && origErr.response ? origErr.response : null;
    const urlThatWasUsed = errResponse ? errResponse.config.url : undefined;

    let responseStatusCode: number;
    if (errResponse && errResponse.status) {
        responseStatusCode = errResponse.status;
    } else {
        if (!urlThatWasUsed) {
            logger.warn(
                "The response didn't have a url. Please investigate since that might be the cause of the error occurring",
            );
        } else {
            logger.warn(
                "The server didn't provide a status code so we replaced it with 500 to prevent downstream issues." +
                'You might have the wrong URL (that can often cause a no status code scenario ' +
                'since Axios never hit a server that could even respond with a code). ' +
                `We tried ${urlThatWasUsed}`,
            );
        }
        responseStatusCode = httpStatusCodes.INTERNAL_SERVER_ERROR;
    }

    const dataFromError = errResponse && errResponse.data ? errResponse.data : null;
    const errMessage = translateResponseToErrorMessage(dataFromError, responseStatusCode, urlThatWasUsed);

    // check for a really stupid Veritime error message
    if (errMessage.split('FOREIGN KEY').length > 1) {
        responseStatusCode = httpStatusCodes.CREATED;
    }

    const whatWasCalled = requestOptions.serviceName
        ? `${requestOptions.serviceName} (specifically ${requestOptions.url} )`
        : `${requestOptions.url}`;

    const tabSize = 4;
    const newError = createHttpError(
        responseStatusCode,
        `Error while calling ${whatWasCalled}. Full error object: ${JSON.stringify(errMessage, null, tabSize)}`,
    );

    throw newError;
};