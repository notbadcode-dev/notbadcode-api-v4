
import { AuthHelper } from '@test/e2e/utils/auth.helper';
import { GroupLinksHelper } from '@test/e2e/utils/group-links.helper';
import { LinksHelper } from '@test/e2e/utils/links.helper';

describe('Cascading Behavior (e2e)', () => {
  const LINKS_URL = process.env.LINKS_SERVICE_URL || 'https://localhost:60201';

  let authHelper: AuthHelper;
  let linksHelper: LinksHelper;
  let groupLinksHelper: GroupLinksHelper;
  let accessToken: string;

  beforeAll(async () => {
    authHelper = new AuthHelper();
    linksHelper = new LinksHelper();
    groupLinksHelper = new GroupLinksHelper();

    const tokens = await authHelper.register();
    accessToken = tokens.accessToken;
  });

  it('should set groupLinkId to null when the associated group is deleted (SET NULL)', async () => {
    // 1. Create a group
    const group = await groupLinksHelper.createGroupLink(accessToken, { title: 'Parent Group' });
    const groupId = group.id;

    // 2. Create a link associated with that group
    const link = await linksHelper.createLink(accessToken, {
      ...linksHelper.createTestLink('cascading'),
      groupLinkId: groupId,
    });
    const linkId = link.id;

    expect(link.groupLinkId).toBe(groupId);

    // 3. Delete the group
    await groupLinksHelper.deleteGroupLink(accessToken, groupId);

    // 4. Verify the link still exists but groupLinkId is null
    const updatedLink = await linksHelper.getLink(accessToken, linkId);
    expect(updatedLink.id).toBe(linkId);
    expect(updatedLink.groupLinkId).toBeNull();
  });
});
