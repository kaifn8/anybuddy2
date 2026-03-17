/**
 * AppIcon — Central color-icon wrapper using Iconify.
 * Uses flat-color-icons (MIT) and streamline-emojis for all app UI icons.
 * Pass a `name` from the union below; size defaults to 24.
 */
import { Icon } from '@iconify/react';

// flat-color-icons (MIT, Icons8)
import homeIcon from '@iconify-json/flat-color-icons/icons/home.json';
import settingsIcon from '@iconify-json/flat-color-icons/icons/settings.json';
import plusIcon from '@iconify-json/flat-color-icons/icons/plus.json';
import searchIcon from '@iconify-json/flat-color-icons/icons/search.json';
import shareIcon from '@iconify-json/flat-color-icons/icons/share.json';
import bookmarkIcon from '@iconify-json/flat-color-icons/icons/bookmark.json';
import calendarIcon from '@iconify-json/flat-color-icons/icons/calendar.json';
import statisticsIcon from '@iconify-json/flat-color-icons/icons/statistics.json';
import todoListIcon from '@iconify-json/flat-color-icons/icons/todo-list.json';
import conferenceCallIcon from '@iconify-json/flat-color-icons/icons/conference-call.json';
import inviteIcon from '@iconify-json/flat-color-icons/icons/invite.json';
import likeIcon from '@iconify-json/flat-color-icons/icons/like.json';
import feedbackIcon from '@iconify-json/flat-color-icons/icons/feedback.json';
import commentsIcon from '@iconify-json/flat-color-icons/icons/comments.json';
import trophyIcon from '@iconify-json/flat-color-icons/icons/icons8-cup.json';
import globeIcon from '@iconify-json/flat-color-icons/icons/globe.json';
import clockIcon from '@iconify-json/flat-color-icons/icons/clock.json';
import infoIcon from '@iconify-json/flat-color-icons/icons/info.json';
import cancelIcon from '@iconify-json/flat-color-icons/icons/cancel.json';
import checkmarkIcon from '@iconify-json/flat-color-icons/icons/checkmark.json';
import vipIcon from '@iconify-json/flat-color-icons/icons/vip.json';
import ratingIcon from '@iconify-json/flat-color-icons/icons/rating.json';
import moneyTransferIcon from '@iconify-json/flat-color-icons/icons/money-transfer.json';
import lockIcon from '@iconify-json/flat-color-icons/icons/lock.json';
import unlockIcon from '@iconify-json/flat-color-icons/icons/unlock.json';
import businessmanIcon from '@iconify-json/flat-color-icons/icons/businessman.json';
import collaborationIcon from '@iconify-json/flat-color-icons/icons/collaboration.json';
import supportIcon from '@iconify-json/flat-color-icons/icons/support.json';
import departmentIcon from '@iconify-json/flat-color-icons/icons/department.json';
import newsIcon from '@iconify-json/flat-color-icons/icons/news.json';
import ideaIcon from '@iconify-json/flat-color-icons/icons/idea.json';

// streamline-emojis (color illustrated)
import bellIcon from '@iconify-json/streamline-emojis/icons/bell.json';
import bellSlashIcon from '@iconify-json/streamline-emojis/icons/bell-with-slash.json';
import fireIcon from '@iconify-json/streamline-emojis/icons/fire.json';
import snowflakeIcon from '@iconify-json/streamline-emojis/icons/snowflake.json';
import crownIcon from '@iconify-json/streamline-emojis/icons/crown.json';
import sparklesIcon from '@iconify-json/streamline-emojis/icons/sparkles.json';
import mapIcon from '@iconify-json/streamline-emojis/icons/world-map.json';
import trophyEmojiIcon from '@iconify-json/streamline-emojis/icons/trophy-1.json';

// Build icon data objects (prefix + body = valid Iconify icon data)
function makeIcon(json: { body: string; width?: number; height?: number }) {
  return { ...json };
}

const ICONS = {
  // Navigation
  home: makeIcon(homeIcon),
  settings: makeIcon(settingsIcon),
  plus: makeIcon(plusIcon),
  globe: makeIcon(globeIcon),
  comments: makeIcon(commentsIcon),
  bell: makeIcon(bellIcon),
  'bell-slash': makeIcon(bellSlashIcon),
  businessman: makeIcon(businessmanIcon),

  // Actions
  search: makeIcon(searchIcon),
  share: makeIcon(shareIcon),
  bookmark: makeIcon(bookmarkIcon),
  like: makeIcon(likeIcon),
  feedback: makeIcon(feedbackIcon),
  invite: makeIcon(inviteIcon),
  cancel: makeIcon(cancelIcon),
  checkmark: makeIcon(checkmarkIcon),
  info: makeIcon(infoIcon),
  lock: makeIcon(lockIcon),
  unlock: makeIcon(unlockIcon),

  // Social / gamification
  'conference-call': makeIcon(conferenceCallIcon),
  collaboration: makeIcon(collaborationIcon),
  'todo-list': makeIcon(todoListIcon),
  statistics: makeIcon(statisticsIcon),
  trophy: makeIcon(trophyIcon),
  'trophy-emoji': makeIcon(trophyEmojiIcon),
  vip: makeIcon(vipIcon),
  rating: makeIcon(ratingIcon),
  crown: makeIcon(crownIcon),
  fire: makeIcon(fireIcon),
  snowflake: makeIcon(snowflakeIcon),
  sparkles: makeIcon(sparklesIcon),
  support: makeIcon(supportIcon),
  department: makeIcon(departmentIcon),

  // Utility
  calendar: makeIcon(calendarIcon),
  clock: makeIcon(clockIcon),
  'money-transfer': makeIcon(moneyTransferIcon),
  news: makeIcon(newsIcon),
  idea: makeIcon(ideaIcon),
  map: makeIcon(mapIcon),
} as const;

export type AppIconName = keyof typeof ICONS;

interface AppIconProps {
  name: AppIconName;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export function AppIcon({ name, size = 24, className, style }: AppIconProps) {
  const iconData = ICONS[name];
  return (
    <Icon
      icon={iconData}
      width={size}
      height={size}
      className={className}
      style={style}
    />
  );
}
