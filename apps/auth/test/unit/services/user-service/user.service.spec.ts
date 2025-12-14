import { UserService } from '@apps/auth/src/application/services';

import { UserServiceFixture } from './user.service.fixture';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
    jest.clearAllMocks();
  });

  describe('getUserSessions', () => {
    it('should build the user session payload with the provided data', () => {
      // Arrange
      const userId = UserServiceFixture.userId();
      const sessionId = UserServiceFixture.sessionId();

      // Act
      const result = service.getUserSessions(userId, sessionId);

      // Assert
      expect(result).toEqual(UserServiceFixture.userSession());
    });
  });

  describe('getUserSessionWithDate', () => {
    it('should include the login date in ISO format', () => {
      // Arrange
      const userId = UserServiceFixture.userId();
      const sessionId = UserServiceFixture.sessionId();
      const loginDate = UserServiceFixture.loginDate();
      jest.useFakeTimers().setSystemTime(loginDate);
      const getUserSessionsSpy = jest.spyOn(service, 'getUserSessions');

      // Act
      const result = service.getUserSessionWithDate(userId, sessionId);

      // Assert
      expect(getUserSessionsSpy).toHaveBeenCalledWith(userId, sessionId);
      expect(result).toEqual(UserServiceFixture.userSessionWithDate());

      jest.useRealTimers();
    });
  });
});
