import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthConstants } from '@apps/auth/src/constants';

@Injectable()
export class HashService {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, AuthConstants.saltsRounds);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
