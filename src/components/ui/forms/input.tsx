import { forwardRef } from 'react';
import cn from 'classnames';

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  label?: string;
  error?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  useUppercaseLabel?: boolean;
  suffix?: React.ReactNode;
  suffixClassName?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      type = 'text',
      className,
      inputClassName,
      labelClassName,
      suffix,
      suffixClassName,
      useUppercaseLabel = true,
      ...props
    },
    ref,
  ) => (
    <div className={cn('text-xs sm:text-sm', className)}>
      <div className={labelClassName}>
        {label && (
          <span
            className={cn(
              'block font-medium tracking-widest dark:text-gray-100',
              useUppercaseLabel ? 'mb-2 uppercase sm:mb-3' : 'mb-2',
            )}
          >
            {label}

            {props.required && (
              <sup className="inline-block text-[13px] text-red-500 ltr:ml-1 rtl:mr-1">
                *
              </sup>
            )}
          </span>
        )}
        <input
          type={type}
          ref={ref}
          {...props}
          className={cn(
            'mt-1 block h-10 w-full rounded-lg border border-bitchest-blue bg-bitchest-white px-4 py-2 text-sm text-bitchest-blue placeholder-bitchest-blue transition-shadow duration-200 invalid:border-bitchest-red invalid:text-bitchest-red focus:border-bitchest-light-blue focus:outline-none focus:ring-1 focus:ring-bitchest-light-blue disabled:border-bitchest-blue/40 disabled:bg-bitchest-white disabled:text-bitchest-blue/60',
            inputClassName,
          )}
        />
        {suffix && (
          <span
            className={cn('whitespace-nowrap leading-normal', suffixClassName)}
          >
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <span role="alert" className="mt-2 block text-bitchest-red sm:mt-2.5">
          {error}
        </span>
      )}
    </div>
  ),
);

Input.displayName = 'Input';
export default Input;
