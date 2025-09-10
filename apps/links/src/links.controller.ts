import { Controller, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('links')
export class LinksController {
  constructor() {}

  @Post('test')
  @ApiOkResponse()
  async test(): Promise<boolean> {
    return true;
  }
}
