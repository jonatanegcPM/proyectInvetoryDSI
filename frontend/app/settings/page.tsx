import Layout from "@/components/layout"
import Settings from "@/components/settings"
import { AuthCheck } from "@/components/auth-check"

export default function SettingsPage() {
  return (
    <AuthCheck>
      <Layout>
        <Settings />
      </Layout>
    </AuthCheck>
  )
}

