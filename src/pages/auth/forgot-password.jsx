import { useState } from "react";
import { useRouter } from "next/router";
import { ForgotPasswordForm } from "../../components/ForgotPasswordForm";
import Layout from "../../components/Layout";

export default function SignUp() {
  return (
    <Layout>
      <ForgotPasswordForm />
    </Layout>
  );
}
