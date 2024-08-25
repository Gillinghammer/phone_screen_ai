// page: account/index.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";
import Layout from "../../components/Layout";

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

  const renderSubscriptionInfo = () => {
    const subscription = user.company?.subscriptions?.[0];
    return (
      <div className="mt-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Subscription Information</h2>
        {subscription ? (
          <>
            <p>Status: <span className="font-medium">{subscription.status}</span></p>
            <p>Plan: <span className="font-medium">{subscription.plan}</span></p>
            <p>Product: <span className="font-medium">{subscription.product}</span></p>
            <p>Start Date: <span className="font-medium">{new Date(subscription.startDate).toLocaleDateString()}</span></p>
            {subscription.endDate && (
              <p>End Date: <span className="font-medium">{new Date(subscription.endDate).toLocaleDateString()}</span></p>
            )}
          </>
        ) : (
          <p>No active subscription found.</p>
        )}
      </div>
    );
  };

  const renderPaymentMethodInfo = () => {
    const paymentMethod = user.company?.paymentMethod;
    return (
      <div className="mt-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
        {paymentMethod ? (
          <>
            <p>Type: <span className="font-medium">{paymentMethod.type}</span></p>
            <p>Last 4 digits: <span className="font-medium">{paymentMethod.last4}</span></p>
            <p>Expiry: <span className="font-medium">{paymentMethod.expMonth}/{paymentMethod.expYear}</span></p>
          </>
        ) : (
          <p>No payment method on file.</p>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>

        {isEditMode ? (
          <form>
            <div className="mb-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
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

            <div className="mb-4">
              <Label htmlFor="companyName">Company</Label>
              <Input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSaveClick}>Save</Button>
              <Button variant="outline" onClick={() => setIsEditMode(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <p>Name: {name}</p>
            <p>Email: {email}</p>
            <p>Company: {companyName}</p>

            <Button onClick={handleEditClick}>Edit Profile</Button>
          </div>
        )}

        {renderSubscriptionInfo()}
        {/* {renderPaymentMethodInfo()} */}

        {!isEditMode && (
          <div className="mt-4">
            {isChangePasswordMode ? (
              <form onSubmit={handlePasswordChangeSubmit}>
                <div className="mb-4">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
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
                  <Button type="submit">Change Password</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsChangePasswordMode(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button variant={"outline"} onClick={handleChangePasswordClick}>
                Change Password
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;