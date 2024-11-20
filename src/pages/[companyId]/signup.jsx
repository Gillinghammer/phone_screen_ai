import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SignUpForm } from "../../components/SignUpForm";
import Layout from "../../components/Layout";
import { prisma } from '../../lib/prisma';

export async function getServerSideProps({ params }) {
  const { companyId } = params;
  
  try {
    const companyIdInt = parseInt(companyId, 10);
    
    console.log('Fetching company with ID:', companyIdInt);
    
    const company = await prisma.company.findUnique({
      where: { id: companyIdInt },
      select: { whitelabel_logo: true }
    });
    
    console.log('Found company:', company);
    
    if (!company) {
      console.log('Company not found');
      return {
        props: { whitelabelLogo: null }
      };
    }
    
    return {
      props: {
        whitelabelLogo: company.whitelabel_logo || null,
      }
    };
  } catch (error) {
    console.error('Error fetching company:', error);
    return {
      props: { 
        whitelabelLogo: null,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    };
  }
}

export default function WhiteLabelSignUp({ whitelabelLogo }) {
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

  if (!isReady) {
    return <Layout><div>Loading...</div></Layout>;
  }
  console.log(whitelabelLogo);
  return (
    <Layout whitelabelLogo={whitelabelLogo}>
      <SignUpForm 
        isWhiteLabel={true} 
        parentCompanyId={companyId} 
      />
    </Layout>
  );
} 