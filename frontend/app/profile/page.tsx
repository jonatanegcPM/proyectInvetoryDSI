import Layout from "@/components/layout"
import { UserProfile } from "@/components/profile/user-profile"
import { AuthCheck } from "@/components/auth-check"

export default function ProfilePage() {
  return (
    <AuthCheck>
      <Layout>
        <UserProfile />
      </Layout>
    </AuthCheck>
  )
}
