'use client';

import Image from '@/components/ui/image';
import AnchorLink from '@/components/ui/links/anchor-link';
import { useIsMounted } from '@/lib/hooks/use-is-mounted';
import { useIsDarkMode } from '@/lib/hooks/use-is-dark-mode';
import { useLayout } from '@/lib/hooks/use-layout';
import lightLogo from '@/assets/images/logo.jpg';
import darkLogo from '@/assets/images/logo.jpg';
import routes from '@/config/routes';
import { LAYOUT_OPTIONS } from '@/lib/constants';
import cn from 'classnames';

interface LogoPropTypes {
  className?: string;
}

export default function Logo({ className }: LogoPropTypes) {
  const { layout } = useLayout();
  const isMounted = useIsMounted();
  const { isDarkMode } = useIsDarkMode();
  return (
    isMounted && (
      <AnchorLink
        href={{
          pathname:
            routes.home + (layout === LAYOUT_OPTIONS.MODERN ? '' : layout),
        }}
        className={cn('flex w-28 outline-none sm:w-80 4xl:w-80', className)}
      >
        <span className="relative flex items-center gap-2 overflow-hidden">
          <span className="font-extrabold text-3xl">Bitchest</span>
          {isDarkMode && (
            <Image src={darkLogo} alt="Bitchest" height={120} priority />
          )}
          {!isDarkMode && (
            <Image src={lightLogo} alt="Bitchest" height={120} priority />
          )}
        </span>
      </AnchorLink>
    )
  );
}
