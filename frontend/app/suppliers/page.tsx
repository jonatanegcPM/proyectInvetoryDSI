import Layout from "@/components/layout"
import Suppliers from "@/components/suppliers"
import { AuthCheck } from "@/components/auth-check"

export default function SuppliersPage() {
  return (
    <AuthCheck>
      <Layout>
        <Suppliers />
      </Layout>
    </AuthCheck>
  )
}

