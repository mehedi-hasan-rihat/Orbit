"use client";

import { useState } from "react";
import { updateProfile, changePassword, deleteAccount } from "@/lib/actions/profile";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  user: { name: string; email: string };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [profileErrors, setProfileErrors] = useState<Record<string, string[]>>({});
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwErrors, setPwErrors] = useState<Record<string, string[]>>({});
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const router = useRouter();

  async function handleProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileErrors({});
    setProfileSuccess(false);

    const result = await updateProfile(new FormData(e.currentTarget));
    if (result.error) {
      setProfileErrors(result.error as Record<string, string[]>);
    } else {
      setProfileSuccess(true);
      router.refresh();
    }
    setProfileLoading(false);
  }

  async function handlePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwLoading(true);
    setPwErrors({});
    setPwSuccess(false);

    const result = await changePassword(new FormData(e.currentTarget));
    if (result.error) {
      setPwErrors(result.error as Record<string, string[]>);
    } else {
      setPwSuccess(true);
      (e.target as HTMLFormElement).reset();
    }
    setPwLoading(false);
  }

  async function handleDelete() {
    if (deleteConfirm !== "DELETE") return;
    setDeleteLoading(true);
    await deleteAccount();
    router.push("/");
  }

  return (
    <div className="space-y-6">
      {/* Profile info */}
      <div className="border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b bg-muted/20">
          <h2 className="text-sm font-semibold">Profile Information</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Update your name and email address</p>
        </div>
        <form onSubmit={handleProfile} className="p-5 space-y-4">
          {profileErrors._form && (
            <p className="text-sm text-destructive">{profileErrors._form[0]}</p>
          )}
          {profileSuccess && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400">
              Profile updated successfully.
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                defaultValue={user.name}
                required
                className="flex h-9 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {profileErrors.name && <p className="text-xs text-destructive">{profileErrors.name[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                required
                className="flex h-9 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {profileErrors.email && <p className="text-xs text-destructive">{profileErrors.email[0]}</p>}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profileLoading}
              className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {profileLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b bg-muted/20">
          <h2 className="text-sm font-semibold">Change Password</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Choose a strong password</p>
        </div>
        <form onSubmit={handlePassword} className="p-5 space-y-4">
          {pwErrors._form && (
            <p className="text-sm text-destructive">{(pwErrors._form as string[])[0]}</p>
          )}
          {pwSuccess && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400">
              Password changed successfully.
            </div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="currentPassword" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Current Password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              className="flex h-9 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {pwErrors.currentPassword && <p className="text-xs text-destructive">{pwErrors.currentPassword[0]}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="newPassword" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={8}
                className="flex h-9 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {pwErrors.newPassword && <p className="text-xs text-destructive">{pwErrors.newPassword[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="flex h-9 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {pwErrors.confirmPassword && <p className="text-xs text-destructive">{pwErrors.confirmPassword[0]}</p>}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pwLoading}
              className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {pwLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Danger zone */}
      <div className="border border-destructive/30 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-destructive/20 bg-destructive/5">
          <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Permanently delete your account and all data
          </p>
        </div>
        <div className="p-5">
          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className="h-8 px-4 rounded-lg border border-destructive/30 text-destructive text-xs font-medium hover:bg-destructive/10 transition-colors"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-3 max-w-sm">
              <p className="text-sm text-muted-foreground">
                This will permanently delete your account, all applications, interviews, and data.
                Type <strong>DELETE</strong> to confirm.
              </p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="flex h-9 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-destructive"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleteConfirm !== "DELETE" || deleteLoading}
                  className="h-8 px-4 rounded-lg bg-destructive text-white text-xs font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  {deleteLoading ? "Deleting..." : "Confirm Delete"}
                </button>
                <button
                  onClick={() => { setShowDelete(false); setDeleteConfirm(""); }}
                  className="h-8 px-4 rounded-lg border text-xs font-medium hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
