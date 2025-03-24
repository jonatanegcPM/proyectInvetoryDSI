
import Layout from "@/components/layout"
import { AuthCheck } from "@/components/auth-check"

export default function Home() {
  return (
    <AuthCheck>
      <Layout>
        
      </Layout>
    </AuthCheck>
  )
}

