export const PageHeader = ({ eyebrow, title, description, actions }) => (
  <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
    <div>
      {eyebrow && <p className="text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>}
      <h2 className="page-title">{title}</h2>
      {description && <p className="mt-2 max-w-3xl text-sm text-gray-500 dark:text-slate-400">{description}</p>}
    </div>
    {actions && <div className="flex w-full flex-wrap gap-3 [&>button]:w-full sm:w-auto sm:shrink-0 sm:[&>button]:w-auto">{actions}</div>}
  </header>
);
