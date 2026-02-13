import { type ApiFailureResponse, EApiResponseMessageType } from '@common/responses';

import { AuthErrorMessageConstants } from '@apps/auth/src/constants';
import { BaseHandlerFixture } from '@apps/auth/test/unit/handlers/base.handler.fixture';

export class RegisterHandlerFixture extends BaseHandlerFixture {
  static emailExistsResponse(): ApiFailureResponse {
    return {
      success: false,
      messageList: [
        {
          type: EApiResponseMessageType.Error,
          message: AuthErrorMessageConstants.emailAlreadyExists,
        },
      ],
    };
  }

  static payloadErrorResponse(): ApiFailureResponse {
    return {
      success: false,
      messageList: [
        {
          type: EApiResponseMessageType.Error,
          message: 'Error creating payload',
        },
      ],
    };
  }
}
