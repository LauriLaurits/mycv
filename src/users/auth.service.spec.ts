import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create copy of an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates new password with a salted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.com', 'asf');
    expect(user.password).not.toEqual('asf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });
  it('throws an error if user signs up with email that in use', async (done) => {
    /* fakeUsersService.find = () =>
      Promise.resolve([
        { id: 1, email: 'asdf@asfd.com', password: 'asf' } as User,
      ]);*/
    await service.signup('asdf@asdf.com', 'asf');
    try {
      await service.signup('asdf@asdf.com', 'asf');
    } catch (err) {
      done();
    }
  });
  it('throws if sign in is called with an unused email', async (done) => {
    try {
      await service.signin('asdf@asdf.com', 'asf');
    } catch (err) {
      done();
    }
  });
  it('throws if an invalid password is provided', async (done) => {
    /*fakeUsersService.find = () =>
      Promise.resolve([{ email: 'asdf@asdf.com', password: 'asf' } as User]);*/
    await service.signup('asdf@asdf.com', 'mypass');
    try {
      await service.signin('asdf@asdf.com', 'password');
    } catch (err) {
      done();
    }
  });
  it('returns a user if correct password is provided', async () => {
    await service.signup('asdf@asdf.com', 'password');

    const user = await service.signin('asdf@asdf.com', 'password');
    expect(user).toBeDefined();
  });
});
