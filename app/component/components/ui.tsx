import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "danger";
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: ButtonProps) {
  const base =
    "rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.99]";

  const styles =
    variant === "outline"
      ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
      : variant === "danger"
        ? "bg-red-600 text-white hover:bg-red-700"
        : "bg-slate-950 text-white hover:bg-slate-800";

  return (
    <button {...rest} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">{children}</div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 ${props.className ?? ""}`}
    />
  );
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 ${props.className ?? ""}`}
    />
  );
}


// import React from "react";

// export function Card({ children }: { children: React.ReactNode }) {
//   return <div className="rounded-2xl border bg-white p-5 shadow-sm">{children}</div>;
// }

// export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
//   return (
//     <input
//       {...props}
//       className={`w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 ${props.className ?? ""}`}
//     />
//   );
// }

// export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
//   return (
//     <select
//       {...props}
//       className={`w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 ${props.className ?? ""}`}
//     />
//   );
// }