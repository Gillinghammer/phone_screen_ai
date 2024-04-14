import { useState } from "react";
import { useRouter } from "next/router";
import { SignUpForm } from "../../components/SignUpForm";
import Layout from "../../components/Layout";

export default function SignUp() {
  return (
    <Layout>
      <SignUpForm />
    </Layout>
  );
}
