import { Button } from './Button';
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <div role="alert" className="rounded-2xl border border-error-line bg-error-surface p-6 text-error"><p>{message}</p>{retry && <Button onClick={retry} className="mt-4">Try again</Button>}</div>;
}
