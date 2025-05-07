import PermissionsSettings from "../_components/permissiong-settings";

export default function PermissionsPage() {
  return (
    <div className="container py-10">
      <h1 className="mb-6 text-3xl font-bold">Permission Management</h1>
      <p className="mb-8 text-muted-foreground">
        Cấu hình quyền truy cập cho người dùng trong ứng dụng của bạn. Bạn có
        thể cấu hình quyền truy cập cho từng người dùng hoặc nhóm người dùng.
      </p>
      <PermissionsSettings />
    </div>
  );
}
