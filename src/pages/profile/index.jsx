// page: account/index.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";
import Layout from "../../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoCircledIcon } from "@radix-ui/react-icons";

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  const session = await getSession(context);
  console.log("debug session", session);
  if (!session || !session.user?.email) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    include: {
      company: {
        include: {
          subscriptions: true,
        },
      },
    },
  });

  return {
    props: {
      user: JSON.parse(JSON.stringify(user)),
    },
  };
}

const ProfilePage = ({ user }) => {
  console.log("user", user);
  const [isEditMode, setIsEditMode] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [companyName, setCompanyName] = useState(user.company?.name || "");
  const [webhookUrl, setWebhookUrl] = useState(user.company?.webhookUrl || "");

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleSaveClick = async (e) => {
    e.preventDefault();
    const updatedProfile = {
      name: name,
      email: email,
      companyName,
      companyId: user.company.id,
      webhookUrl,
    };

    try {
      const response = await fetch("/api/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProfile),
      });

      if (response.ok) {
        alert("Profile updated successfully");
        setIsEditMode(false);
      }
      console.log("response", response);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }
  };

  const [isChangePasswordMode, setIsChangePasswordMode] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePasswordClick = () => {
    setIsChangePasswordMode(true);
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    try {
      const response = await fetch("/api/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        alert("Password changed successfully");
        setIsChangePasswordMode(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await response.json();
        alert(data.message || "Error changing password. Please try again.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Error changing password. Please try again.");
    }
  };

  const renderProfileSection = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditMode ? (
          <form onSubmit={handleSaveClick}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="companyName">Company</Label>
                <Input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://example.com/webhook"
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit">Save</Button>
                <Button variant="outline" onClick={() => setIsEditMode(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Company:</strong> {companyName}</p>
            <p><strong>Webhook URL:</strong> {webhookUrl || "Not set"}</p>
            <Button onClick={handleEditClick} className="mt-4">Edit Profile</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderWebhookInfo = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Webhook Information</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Webhooks allow you to receive real-time notifications about events in your account. 
          When set up, we'll send HTTP POST requests to your specified URL for the following events:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>Job Added</li>
          <li>Job Updated</li>
          <li>Candidate Screened</li>
        </ul>
        <p className="mb-4">
          Ensure your endpoint is set up to handle these requests securely. 
          For more information on setting up and using webhooks, please refer to our documentation.
        </p>
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mt-4">
          <p className="font-semibold mb-2">Tip: Use Zapier for Easy Integration</p>
          <p>
            Don't have a webhook endpoint? You can use Zapier to easily integrate PhoneScreen.AI with your existing recruiting software. 
            Zapier can listen for your webhooks and trigger actions in other apps, making it simple to automate your workflow.
          </p>
          <a 
            href="https://zapier.com/blog/what-are-webhooks/#example" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-purple-600 hover:underline mt-2 inline-block"
          >
            Learn how to set up webhooks with Zapier
          </a>
        </div>
      </CardContent>
    </Card>
  );

  const renderSubscriptionInfo = () => {
    const subscription = user.company?.subscriptions?.[0];
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Subscription Information</CardTitle>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-2">
              <p><strong>Status:</strong> {subscription.status}</p>
              <p><strong>Plan:</strong> {subscription.plan}</p>
              <p><strong>Product:</strong> {subscription.product}</p>
              <p><strong>Start Date:</strong> {new Date(subscription.startDate).toLocaleDateString()}</p>
              {subscription.endDate && (
                <p><strong>End Date:</strong> {new Date(subscription.endDate).toLocaleDateString()}</p>
              )}
            </div>
          ) : (
            <p>No active subscription found.</p>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderPaymentMethodInfo = () => {
    const paymentMethod = user.company?.paymentMethod;
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentMethod ? (
            <div className="space-y-2">
              <p><strong>Type:</strong> {paymentMethod.type}</p>
              <p><strong>Last 4 digits:</strong> {paymentMethod.last4}</p>
              <p><strong>Expiry:</strong> {paymentMethod.expMonth}/{paymentMethod.expYear}</p>
            </div>
          ) : (
            <p>No payment method on file.</p>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderChangePassword = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        {isChangePasswordMode ? (
          <form onSubmit={handlePasswordChangeSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button variant="destructive" type="submit">Change Password</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsChangePasswordMode(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <Button variant="destructive" onClick={handleChangePasswordClick}>
            Change Password
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {renderProfileSection()}
            {renderChangePassword()}
          </div>
          <div>
            {renderWebhookInfo()}
            {renderSubscriptionInfo()}
            {/* {renderPaymentMethodInfo()} */}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;