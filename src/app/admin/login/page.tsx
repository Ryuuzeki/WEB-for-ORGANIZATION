import { redirect } from "next/navigation";
import { getAdminSessionAction } from "@/application/actions/adminActions";
import AdminLoginPage from "@/presentation/app/admin/login/page";

export const metadata = {
  title: "Login Admin - HMTKBA",
  description: "Halaman masuk admin Himpunan Mahasiswa Teknologi Konstruksi Bangunan Air.",
};

export default async function Page() {
  const session = await getAdminSessionAction();

  if (session) {
    redirect("/admin");
  }
  
  return <AdminLoginPage />;
}
