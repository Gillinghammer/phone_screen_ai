import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SignUpForm } from "../../components/SignUpForm";
import Layout from "../../components/Layout";

export default function WhiteLabelSignUp() {
  const router = useRouter();
  const { companyId } = router.query;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      if (!companyId) {
        router.push('/404');
        return;
      }
      setIsReady(true);
    }
  }, [router.isReady, companyId, router]);

  console.log("White Label Signup - Company ID:", companyId);

  if (!isReady) {
    return <Layout><div>Loading...</div></Layout>;
  }

  return (
    <Layout>
      <SignUpForm 
        isWhiteLabel={true} 
        parentCompanyId={companyId} 
      />
    </Layout>
  );
} 