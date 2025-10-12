import React from "react";

export default function HeaderSection({
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <header
      className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${className}`}
      aria-labelledby="page-title"
    >
      <div>
        {title ? (
          <h1 id="page-title" className="text-3xl font-bold text-slate-900">
            {title}
          </h1>
        ) : null}
        {subtitle ? (
          <p className="text-slate-600 mt-1">{subtitle}</p>
        ) : null}
      </div>

      {children ? (
        <div className="flex items-center gap-2">{children}</div>
      ) : null}
    </header>
  );
}
