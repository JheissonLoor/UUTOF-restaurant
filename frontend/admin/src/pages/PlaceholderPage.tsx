interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps): JSX.Element {
  return (
    <section className="rounded-lg border border-dashed border-[rgba(42,30,20,0.14)] bg-white p-8 shadow-sm-soft">
      <p className="text-label uppercase text-ink-500">Fase B</p>
      <h1 className="mt-2 font-serif text-h1">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-500">{description}</p>
    </section>
  );
}
