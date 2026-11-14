import type { ComponentProps } from 'react';
export function Button({ className = '', type = 'button', ...props }: ComponentProps<'button'>) {
  return <button type={type} className={'primary-button rounded-xl bg-primary px-5 py-3 font-semibold text-primary-ink hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 ' + className} {...props} />;
}
