export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("🔷 Studys Layout loaded");

  return <div>{children}</div>;
}
