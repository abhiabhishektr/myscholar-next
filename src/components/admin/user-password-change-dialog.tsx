"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { changeUserPassword } from "@/utils/auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { UserWithDetails } from "@/utils/users";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserPasswordChangeDialogProps {
  user: UserWithDetails;
  isOpen: boolean;
  onClose: () => void;
}

export function UserPasswordChangeDialog({
  user,
  isOpen,
  onClose,
}: UserPasswordChangeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setIsLoading(true);
      await changeUserPassword(user.id, newPassword);
      toast.success(`Password changed successfully for ${user.name}`);
      onClose();
      setNewPassword("");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setNewPassword("");
        setShowPassword(false);
      }}
      onConfirm={handlePasswordChange}
      title="Change User Password"
      description={`Set a new password for ${user.name} (${user.email}).`}
      confirmText={isLoading ? "Changing..." : "Change Password"}
    >
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="sr-only">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Password must be at least 8 characters long
          </p>
        </div>
      </div>
    </ConfirmationDialog>
  );
}
