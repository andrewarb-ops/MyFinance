import React from "react";
import { Link, useLocation } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

const MainLayout: React.FC<Props> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/accounts", label: "Accounts" },
    { to: "/categories", label: "Categories" },
    { to: "/transactions", label: "Transactions" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-60 bg-slate-900 text-white flex flex-col">
        <div className="px-4 py-4 text-xl font-semibold border-b border-slate-700">
          MyFinance
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  "block px-3 py-2 rounded-md text-sm " +
                  (active
                    ? "bg-slate-700 text-white"
                    : "text-slate-200 hover:bg-slate-800 hover:text-white")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4">
          <h1 className="text-lg font-medium">MyFinance</h1>
        </header>
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
