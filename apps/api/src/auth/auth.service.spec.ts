import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  const users = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  } as unknown as UsersService;

  const jwt = {
    sign: jest.fn().mockReturnValue('token'),
  } as unknown as JwtService;

  const service = new AuthService(users, jwt);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects duplicate registration', async () => {
    (users.findByEmail as jest.Mock).mockResolvedValue({ id: '1' });
    await expect(
      service.register({
        email: 'a@b.com',
        password: 'password1',
        name: 'A',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects bad login', async () => {
    (users.findByEmail as jest.Mock).mockResolvedValue(null);
    await expect(
      service.login({ email: 'a@b.com', password: 'password1' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
