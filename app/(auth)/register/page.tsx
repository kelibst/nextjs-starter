import { RegisterForm } from "@/components/auth/register-form";
import { getAuthSettings } from "@/lib/settings";

export default async function RegisterPage() {
  const settings = await getAuthSettings();

  return (
    <RegisterForm
      showPassword={settings.allowPasswordAuth}
      showGoogle={settings.allowGoogleOAuth}
      showGithub={settings.allowGithubOAuth}
    />
  );
}
