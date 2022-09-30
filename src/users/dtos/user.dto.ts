import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  // If you use expose response will show this
  /*@Expose()
  password: string;*/
}
