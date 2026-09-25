export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <main className="min-h-screen bg-slate-950 text-white">{children}</main>;
}
