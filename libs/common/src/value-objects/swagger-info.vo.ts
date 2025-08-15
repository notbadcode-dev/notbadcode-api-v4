import { SwaggerConstants } from '@common/constants';

export class SwaggerInfo {
  private constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly version: string,
  ) {}

  static create(title?: string, description?: string, version?: string): SwaggerInfo {
    const resolvedTitle = title || SwaggerConstants.defaultTitle;
    const resolvedDescription = description || SwaggerConstants.defaultDescription;
    const resolvedVersion = version || SwaggerConstants.defaultVersion;

    return new SwaggerInfo(resolvedTitle.trim(), resolvedDescription.trim(), resolvedVersion.trim());
  }
}
