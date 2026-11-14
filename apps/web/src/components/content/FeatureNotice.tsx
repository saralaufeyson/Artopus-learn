export function FeatureNotice({ feature }: { feature: string }) {
  return <p className="rounded-xl border border-dashed border-line p-5">{feature} is reserved for a later phase. This skeleton does not submit or save data.</p>;
}
