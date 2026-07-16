export const Card = ({ children, className = "" }) => (
  <section className={`rounded-xl border border-gray-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900 ${className}`}>
    {children}
  </section>
);
