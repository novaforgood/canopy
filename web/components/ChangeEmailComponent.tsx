// ChangeEmailComponent.tsx

import React, { useState } from "react";

import { EmailAuthProvider, GoogleAuthProvider } from "firebase/auth";
import toast from "react-hot-toast";

import { Button, Modal, Text } from "../components/atomic";
import { TextInput } from "../components/inputs/TextInput";
import { useUserData } from "../hooks/useUserData";
import {
  getCurrentUser,
  reauthenticateWithEmailPassword,
  reauthenticateWithGoogle,
  linkWithCredential,
  verifyBeforeUpdateEmail,
} from "../lib/firebase";

export const ChangeEmailComponent = () => {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [isReauthenticating, setIsReauthenticating] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");
  const { userData } = useUserData();

  const user = getCurrentUser();
  const providers = user?.providerData.map((p) => p.providerId) || [];

  // Function to check if reauthentication is needed
  const needsReauthentication = async () => {
    if (!user) return false;
    const idTokenResult = await user.getIdTokenResult();
    const authTime = new Date(idTokenResult.authTime).getTime();
    const currentTime = Date.now();
    const timeSinceAuth = currentTime - authTime;
    const threshold = 5 * 60 * 1000; // 5 minutes in milliseconds

    return timeSinceAuth > threshold;
  };

  // Function to reauthenticate the user
  const reauthenticateUser = async () => {
    if (!user) return;

    setIsReauthenticating(true);
    try {
      if (providers.includes("password")) {
        if (!reauthPassword) {
          throw new Error("Password is required for reauthentication.");
        }
        await reauthenticateWithEmailPassword(user.email ?? "", reauthPassword);
      } else if (providers.includes("google.com")) {
        await reauthenticateWithGoogle();
      } else {
        throw new Error("No available method to reauthenticate.");
      }
      toast.success("Reauthentication successful");
      setShowReauthModal(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(
          error.message || "Reauthentication failed. Please try again."
        );
      } else {
        toast.error("An unknown error occurred during reauthentication.");
      }
      throw error;
    } finally {
      setIsReauthenticating(false);
      setReauthPassword("");
    }
  };

  // Handler for initiating the email change process
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("No user is currently signed in.");
      return;
    }
    setIsProcessing(true);
    try {
      // Check if reauthentication is needed
      if (await needsReauthentication()) {
        setShowReauthModal(true);
        return;
      }

      // Check if user has password provider
      if (!providers.includes("password")) {
        setNeedsPassword(true);
        setIsModalOpen(true);
      } else {
        // User has password provider
        // Proceed to send verification email
        await verifyBeforeUpdateEmail(newEmail, {
          url: `${window.location.origin}/settings`,
        });
        setShowVerificationModal(true);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(
          error.message || "Failed to update email. Please try again."
        );
        console.error("Error updating email:", error);
      } else {
        toast.error("An unknown error occurred. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler for setting password and updating email
  const handleSetPasswordAndUpdateEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      toast.error("No user is currently signed in.");
      return;
    }
    setIsProcessing(true);
    try {
      // Link Email/Password provider with new password
      const credential = EmailAuthProvider.credential(
        user.email ?? "",
        password
      );
      await linkWithCredential(credential);

      // Send verification email to new email address
      await verifyBeforeUpdateEmail(newEmail, {
        url: `${window.location.origin}/settings`,
      });
      setShowVerificationModal(true);
      setIsModalOpen(false);
      setPassword("");
      setNeedsPassword(false);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(
          error.message || "Failed to update email. Please try again."
        );
        console.error("Error updating email:", error);
      } else {
        toast.error("An unknown error occurred. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <form onSubmit={handleChangeEmail}>
        <Text variant="heading4">Change Account Email</Text>
        <div className="h-4" />
        <Text variant="body1">
          Current email: <b>{userData?.email}</b>
        </Text>
        <div className="h-4" />
        <TextInput
          label="New Email Address"
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          required
        />
        <div className="h-4" />
        <Button
          type="submit"
          size="small"
          disabled={isProcessing || isReauthenticating}
        >
          {isProcessing
            ? "Processing..."
            : isReauthenticating
            ? "Reauthenticating..."
            : "Update Email"}
        </Button>
      </form>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPassword("");
          setNeedsPassword(false);
        }}
      >
        <div className="max-w-lg rounded-lg bg-white p-6 shadow-xl">
          {needsPassword && (
            <>
              <Modal.Title>
                <Text variant="heading3">Set a Password</Text>
              </Modal.Title>
              <div className="h-4" />
              <Modal.Description>
                <Text>Changing your account email requires a password.</Text>
                <div className="h-4" />
                <Text>
                  Since you do not have a password set, please set a password
                  for your account to continue.
                </Text>
              </Modal.Description>
              <div className="h-4" />
              <form onSubmit={handleSetPasswordAndUpdateEmail}>
                <TextInput
                  label="Set a Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="h-4" />
                <Button type="submit" size="small" disabled={isProcessing}>
                  {isProcessing
                    ? "Processing..."
                    : "Set Password and Update Email"}
                </Button>
              </form>
            </>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
      >
        <div className="max-w-lg rounded-lg bg-white p-6 shadow-xl">
          <Modal.Title>
            <Text variant="heading3">Verification Email Sent</Text>
          </Modal.Title>
          <div className="h-4" />
          <Modal.Description>
            <Text>
              A verification email has been sent to your new email address.
              Please check your inbox and follow the instructions to complete
              the email change process.
            </Text>
            <div className="h-4" />
            <Text>
              Email sent to: <b>{newEmail}</b>
            </Text>
          </Modal.Description>
          <div className="h-4" />
          <Button
            onClick={() => {
              setShowVerificationModal(false);
              setNewEmail("");
            }}
            size="small"
          >
            Close
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showReauthModal}
        onClose={() => {
          setShowReauthModal(false);
          setReauthPassword("");
        }}
      >
        <div className="max-w-lg rounded-lg bg-white p-6 shadow-xl">
          <Modal.Title>
            <Text variant="heading3">Reauthentication Required</Text>
          </Modal.Title>
          <div className="h-4" />
          <Modal.Description>
            <Text>
              For security reasons, please reauthenticate to continue changing
              your email.
            </Text>
          </Modal.Description>
          <div className="h-4" />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              reauthenticateUser();
            }}
          >
            {providers.includes("password") && (
              <>
                <TextInput
                  label="Password"
                  type="password"
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  required
                />
                <div className="h-4" />
              </>
            )}
            <Button type="submit" size="small" disabled={isReauthenticating}>
              {isReauthenticating ? "Reauthenticating..." : "Reauthenticate"}
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
};
