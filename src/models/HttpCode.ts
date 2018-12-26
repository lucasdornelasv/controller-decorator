'use strict';


export default class HttpCode {

    //region FIELDS
    static readonly OK : Number = 200;
    static readonly CREATED : Number = 201;
    static readonly NO_CONTENT : Number = 204;
    static readonly NOT_MODIFIED : Number = 304;
    static readonly BAD_REQUEST : Number = 400;
    static readonly UNAUTHORIZED : Number = 401;
    static readonly FORBIDDEN : Number = 403;
    static readonly NOT_FOUND : Number = 404;
    static readonly CONFLICT : Number = 409;
    static readonly INTERNAL_SERVER_ERROR : Number = 500;
    static readonly UNPROCESSABLE_ENTITY : Number = 422;
    //endregion

}


/*
 200 (OK) – General success status code. Most common code to indicate success.
 201 (CREATED) – Successful creation occurred (via either POST or PUT). Set the Location header to
 contain a link to the newly-created resource. Response body content may or may not be present.
 204 (NO CONTENT) – Status when wrapped responses are not used and nothing is in the body (e.g.
 DELETE).
 304 (NOT MODIFIED) – Used in response to conditional GET calls to reduce band-width usage. If
 used, must set the Date, Content-Location, Etag headers to what they would have been on a regular
 GET call. There must be no response body.
 400 (BAD REQUEST) – General error when fulfilling the request would cause an invalid state.
 Domain validation errors, missing data, etc. are some examples.
 401 (UNAUTHORIZED) – Error code for a missing or invalid authentication token.
 403 (FORBIDDEN) – Error code for account not authorized to perform the operation, doesn't have rights
 to access the resource, or the resource is unavailable for some reason (e.g. time constraints, etc.).
 404 (NOT FOUND) – Used when the requested resource is not found, whether it doesn't exist or if
 there was a 401 or 403 that, for security reasons, the service wants to mask.
 409 (CONFLICT) – Whenever a resource conflict would be caused by fulfilling the request.
 Duplicate entries, deleting root objects when cascade-delete not supported are a couple of examples.
 500 (INTERNAL SERVER ERROR) – The general catch-all error when the server-side throws an
 exception.*/