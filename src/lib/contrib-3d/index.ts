import { aggregateUserInfo } from './aggregate-user-info';
import * as template from './color-template';
import { createSvg } from './create-svg';
import { fetchData } from './github-graphql';
import type { Settings } from './type';
import type { Contrib3dStyleId } from './styles';

export {
  CONTRIB_3D_STYLES,
  isContrib3dStyleId,
  type Contrib3dStyleId,
  type Contrib3dStyleOption,
} from './styles';

function resolveSettings(
  style: Contrib3dStyleId,
  isHalloween: boolean
): Settings {
  switch (style) {
    case 'season':
      return template.NorthSeasonSettings;
    case 'south-season':
      return template.SouthSeasonSettings;
    case 'night-view':
      return template.NightViewSettings;
    case 'night-green':
      return template.NightGreenSettings;
    case 'night-rainbow':
      return template.NightRainbowSettings;
    case 'gitblock':
      return template.GitBlockSettings;
    case 'green':
    default:
      return isHalloween ? template.HalloweenSettings : template.NormalSettings;
  }
}

export async function generateContrib3dSvg(
  username: string,
  style: Contrib3dStyleId = 'green',
  options: { animate?: boolean; year?: number | null; maxRepos?: number } = {}
): Promise<string> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is not configured');
  }

  const maxRepos = options.maxRepos ?? 100;
  const year = options.year ?? null;
  const animate = options.animate ?? true;

  const response = await fetchData(token, username, maxRepos, year);

  if (!response.data?.user) {
    const message =
      response.errors?.[0]?.message || `User "${username}" not found`;
    throw new Error(message);
  }

  const userInfo = aggregateUserInfo(response);
  const settings = resolveSettings(style, userInfo.isHalloween);

  return createSvg(userInfo, settings, animate);
}
