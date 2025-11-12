import { useState } from 'react';
import { Close } from '@/components/icons/close';

interface AlertProps {}

export default function Alert({
  children,
}: React.PropsWithChildren<AlertProps>) {
  let [isHidden, setIsHidden] = useState(false);

  if (!isHidden) {
    return (
      <div className="relative rounded-lg bg-bitchest-white py-4 shadow-sm pl-4 pr-8 sm:py-6 sm:pr-10 sm:pl-6">
        {children}

        <div
          className="absolute top-2 cursor-pointer p-2 text-bitchest-light-blue transition-all hover:scale-105 right-2"
          onClick={() => setIsHidden(!isHidden)}
        >
          <Close className="h-auto w-3" />
        </div>
      </div>
    );
  } else {
    return null;
  }
}
