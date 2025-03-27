import Layout from "@/components/layout"
import Inventory from "@/components/inventory"
import { AuthCheck } from "@/components/auth-check"

export default function InventoryPage() {
  return (
    <AuthCheck>
      <Layout>
        <Inventory />
      </Layout>
    </AuthCheck>
  )
}

