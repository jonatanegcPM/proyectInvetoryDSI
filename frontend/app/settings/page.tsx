import { AuthCheck } from "@/components/auth-check"
import Layout from "@/components/layout"
import SettingsPage from "@/components/settings/settings-page"

export default function Settings() {
  return (
    <AuthCheck>
      <Layout>
        <SettingsPage />
      </Layout>
    </AuthCheck>
  )
}
