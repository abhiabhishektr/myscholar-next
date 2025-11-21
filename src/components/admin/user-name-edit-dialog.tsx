"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { updateUserName } from "@/utils/auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { UserWithDetails } from "@/utils/users";

interface UserNameEditDialogProps {
  user: UserWithDetails;
  isOpen: boolean;
  onClose: () => void;
}

export function UserNameEditDialog({
  user,
  isOpen,
  onClose,
}: UserNameEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [newName, setNewName] = useState(user.name);

  const handleNameUpdate = async () => {
    if (!newName || newName.trim().length === 0) {
      toast.error("Name cannot be empty");
      return;
    }

    if (newName === user.name) {
      toast.error("Name is unchanged");
      return;
    }

    try {
      setIsLoading(true);
      await updateUserName(user.id, newName.trim());
      toast.success(`Name updated successfully for ${user.email}`);
      onClose();
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
        setNewName(user.name);
      }}
      onConfirm={handleNameUpdate}
      title="Update User Name"
      description={`Update the name for ${user.email}.`}
      confirmText={isLoading ? "Updating..." : "Update Name"}
    >
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="newName">Name</Label>
          <Input
            id="newName"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter user's name"
            required
          />
        </div>
      </div>
    </ConfirmationDialog>
  );
}
