import { aggregateUserInfo } from './aggregate-user-info';
import * as template from './color-template';
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
    case 'alberto':
      return template.AlbertoSettings;
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

  const login = username.trim().replace(/^@/, '');
  if (!login) {
    throw new Error('Username is required');
  }

  const maxRepos = options.maxRepos ?? 100;
  const year = options.year ?? null;
  const animate = options.animate ?? true;

  const response = await fetchData(token, login, maxRepos, year);

  if (response.errors?.length && !response.data?.user) {
    const gqlMessage = response.errors[0]?.message || 'GitHub GraphQL error';
    if (/could not resolve to a user/i.test(gqlMessage)) {
      throw new Error(`User "${login}" not found`);
    }
    throw new Error(gqlMessage);
  }

  if (!response.data?.user) {
    throw new Error(`User "${login}" not found`);
  }

  const userInfo = aggregateUserInfo(response);
  const settings = resolveSettings(style, userInfo.isHalloween);

  // Lazy-load jsdom/d3 path so route bootstrapping stays light
  const { createSvg } = await import('./create-svg');
  const svg = createSvg(userInfo, settings, animate);
  if (!svg || !svg.includes('<svg')) {
    throw new Error('3D SVG renderer returned an empty result');
  }
  return svg;
}
