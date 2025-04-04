import Layout from "@/components/layout"
import PointOfSale from "@/components/point-of-sale"
import { AuthCheck } from "@/components/auth-check"

export default function PointOfSalePage() {
  return (
    <AuthCheck>
      <Layout>
        <PointOfSale /> 
      </Layout>
    </AuthCheck>
  )
}

