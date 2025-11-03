import { LoginForm } from "@/components/auth/login-form";
import { getAuthSettings } from "@/lib/settings";

export default async function LoginPage() {
  const settings = await getAuthSettings();

  return (
    <LoginForm
      showPassword={settings.allowPasswordAuth}
      showGoogle={settings.allowGoogleOAuth}
      showGithub={settings.allowGithubOAuth}
    />
  );
}
