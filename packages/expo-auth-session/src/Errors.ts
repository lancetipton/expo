import { CodedError } from '@unimodules/core';

/**
 * Server response error.
 */
export interface ResponseErrorConfig extends Record<string, any> {
  /**
   * Error code
   */
  error: string;
  /**
   * Additional message
   */
  error_description?: string;
  /**
   * URI for more info on the error
   */
  error_uri?: string;
}

export interface AuthErrorConfig extends ResponseErrorConfig {
  /**
   * Required only if state is used in the initial request
   */
  state?: string;
}

const errorCodeMessages = {
  // https://tools.ietf.org/html/rfc6749#section-4.1.2.1
  // https://openid.net/specs/openid-connect-core-1_0.html#AuthError
  auth: {
    // OAuth 2.0
    invalid_request: `The request is missing a required parameter, includes an invalid parameter value, includes a parameter more than once, or is otherwise malformed.`,
    unauthorized_client: `The client is not authorized to request an authorization code using this method.`,
    access_denied: `The resource owner or authorization server denied the request.`,
    unsupported_response_type: `The authorization server does not support obtaining an authorization code using this method.`,
    invalid_scope: 'The requested scope is invalid, unknown, or malformed.',
    server_error:
      'The authorization server encountered an unexpected condition that prevented it from fulfilling the request. (This error code is needed because a 500 Internal Server Error HTTP status code cannot be returned to the client via an HTTP redirect.)',
    temporarily_unavailable:
      'The authorization server is currently unable to handle the request due to a temporary overloading or maintenance of the server.  (This error code is needed because a 503 Service Unavailable HTTP status code cannot be returned to the client via an HTTP redirect.)',
    // Open ID Connect error codes
    interaction_required:
      'Auth server requires user interaction of some form to proceed. This error may be returned when the prompt parameter value in the auth request is none, but the auth request cannot be completed without displaying a user interface for user interaction.',
    login_required:
      'Auth server requires user authentication. This error may be returned when the prompt parameter value in the auth request is none, but the auth request cannot be completed without displaying a user interface for user authentication.',
    account_selection_required:
      'User is required to select a session at the auth server. The user may be authenticated at the auth server with different associated accounts, but the user did not select a session. This error may be returned when the prompt parameter value in the auth request is `none`, but the auth request cannot be completed without displaying a user interface to prompt for a session to use.',
    consent_required:
      'Auth server requires user consent. This error may be returned when the prompt parameter value in the auth request is none, but the auth request cannot be completed without displaying a user interface for user consent.',
    invalid_request_uri:
      'The `request_uri` in the auth request returns an error or contains invalid data.',
    invalid_request_object: 'The request parameter contains an invalid request object.',
    request_not_supported:
      'The OP does not support use of the `request` parameter defined in Section 6. (https://openid.net/specs/openid-connect-core-1_0.html#JWTRequests)',
    request_uri_not_supported:
      'The OP does not support use of the `request_uri` parameter defined in Section 6. (https://openid.net/specs/openid-connect-core-1_0.html#JWTRequests)',
    registration_not_supported:
      'The OP does not support use of the `registration` parameter defined in Section 7.2.1. (https://openid.net/specs/openid-connect-core-1_0.html#RegistrationParameter)',
  },
};

/**
 * Extends https://tools.ietf.org/html/rfc6749#section-4.1.2.1
 */
export class ResponseError extends CodedError {
  /**
   * Used to assist the client developer in
   * understanding the error that occurred.
   */
  description?: string;
  /**
   * A URI identifying a human-readable web page with
   * information about the error, used to provide the client
   * developer with additional information about the error.
   */
  uri?: string;
  /**
   * Raw results of the error.
   */
  params: Record<string, string>;

  constructor(params: ResponseErrorConfig, errorCodeType: string) {
    const { error, error_description, error_uri } = params;
    const message = errorCodeMessages[errorCodeType][error];
    let errorMessage: string;
    if (message) {
      errorMessage = message + (error_description ? `\nMore info: ${error_description}` : '');
    } else if (error_description) {
      errorMessage = error_description;
    } else {
      errorMessage = 'An unknown error occurred';
    }
    super(error, errorMessage);
    this.description = error_description ?? message;
    this.uri = error_uri;
    this.params = params;
  }
}

/**
 * Extends https://tools.ietf.org/html/rfc6749#section-5.2
 */
export class AuthError extends ResponseError {
  /**
   * Required only if state is used in the initial request
   */
  state?: string;

  constructor(response: AuthErrorConfig) {
    super(response, 'auth');
    this.state = response.state;
  }
}
