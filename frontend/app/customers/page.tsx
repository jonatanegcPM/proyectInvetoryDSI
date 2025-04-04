import Layout from "@/components/layout"
import Customers from "@/components/customers"
import { AuthCheck } from "@/components/auth-check"

export default function CustomersPage() {
  return (
    <AuthCheck>
      <Layout>
        <Customers />
      </Layout>
    </AuthCheck>
  )
}

