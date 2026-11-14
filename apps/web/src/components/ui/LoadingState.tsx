export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return <p role="status" className="py-10 text-center">{message}</p>;
}
