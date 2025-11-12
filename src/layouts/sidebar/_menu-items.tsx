import routes from '@/config/routes';
import { HomeIcon } from '@/components/icons/home';
import { FarmIcon } from '@/components/icons/farm';
import { PoolIcon } from '@/components/icons/pool';
import { ProfileIcon } from '@/components/icons/profile';
import { DiskIcon } from '@/components/icons/disk';
import { ExchangeIcon } from '@/components/icons/exchange';
import { VoteIcon } from '@/components/icons/vote-icon';
import { PlusCircle } from '@/components/icons/plus-circle';
import { CompassIcon } from '@/components/icons/compass';
import { LivePricing } from '@/components/icons/live-pricing';
import { LockIcon } from '@/components/icons/lock-icon';
import { TradingBotIcon } from '@/components/icons/trading-bot-icon';
import { useRole } from '@/components/role-provider';

export const defaultMenuItems = [
  {
    name: 'Home',
    icon: <HomeIcon />,
    href: routes.home,
  },

  {
    name: 'Live Pricing',
    icon: <LivePricing />,
    href: routes.livePricing,
  },
  {
    name: 'Trading Bot',
    icon: <TradingBotIcon />,
    href: routes.tradingBot,
  },

  {
    name: 'Farm',
    icon: <FarmIcon />,
    href: routes.farms,
  },
  {
    name: 'Swap',
    icon: <ExchangeIcon />,
    href: routes.swap,
  },
  {
    name: 'Liquidity',
    icon: <PoolIcon />,
    href: routes.liquidity,
  },
  {
    name: 'Profile',
    icon: <ProfileIcon />,
    href: routes.profile,
  },
];

export const MinimalMenuItems = [
  {
    name: 'Home',
    icon: <HomeIcon />,
    href: routes.home,
  },
  {
    name: 'Market',

    href: routes.retro,
  },
  {
    name: 'Live Pricing',
    icon: <LivePricing />,
    href: routes.livePricing,
  },
  {
    name: 'Trading Bot',
    icon: <TradingBotIcon />,
    href: routes.tradingBot,
  },

  {
    name: 'Farm',
    icon: <FarmIcon />,
    href: routes.farms,
  },
  {
    name: 'Swap',
    icon: <ExchangeIcon />,
    href: routes.swap,
  },
  {
    name: 'Pages',
    icon: <VoteIcon />,
    href: routes.pages,
    dropdownItems: [
      {
        name: 'Profile',
        icon: <ProfileIcon />,
        href: routes.profile,
      },
      {
        name: 'Liquidity',
        icon: <PoolIcon />,
        href: routes.liquidity,
      },

      {
        name: 'Authentication',
        icon: <LockIcon className="w-[18px]" />,
        href: routes.signIn,
        dropdownItems: [
          {
            name: 'Reset pin',
            href: routes.resetPin,
          },
        ],
      },
    ],
  },
];

export const adminMenuItems = [
  { name: 'Profile', icon: <ProfileIcon />, href: '/admin/profile' },
  { name: 'Users', icon: <HomeIcon />, href: '/admin/users' },
  { name: 'Crypto Prices', icon: <LivePricing />, href: '/admin/cryptos' },
];
export const clientMenuItems = [
  { name: 'Profile', icon: <ProfileIcon />, href: '/client/profile' },
  { name: 'Wallet', icon: <DiskIcon />, href: '/client/wallet' },
  { name: 'Buy/Sell', icon: <ExchangeIcon />, href: '/client/trade' },
  { name: 'Crypto Prices', icon: <LivePricing />, href: '/client/cryptos' },
];
export function useSidebarMenu() {
  const { role } = useRole();
  return role === 'admin' ? adminMenuItems : clientMenuItems;
} // Usage: useSidebarMenu()
