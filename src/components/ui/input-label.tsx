import cn from 'classnames';

interface InputLabelProps {
  title: string;
  subTitle?: string;
  important?: boolean;
  className?: string;
  titleClassName?: string;
}

function InputLabel({
  title,
  subTitle,
  important,
  className,
  titleClassName,
}: InputLabelProps) {
  return (
    <div className={cn('relative mb-3', className)}>
      <span
        className={cn(
          'block text-sm font-semibold uppercase tracking-tight text-bitchest-blue',
          titleClassName,
        )}
      >
        {title}
        {important && (
          <sup className="text-bitchest-red ltr:ml-1.5 rtl:mr-1.5">*</sup>
        )}
      </span>
      {subTitle && (
        <span className="mt-1 block text-xs tracking-tighter text-bitchest-light-blue sm:text-sm">
          {subTitle}
        </span>
      )}
    </div>
  );
}

export default InputLabel;
