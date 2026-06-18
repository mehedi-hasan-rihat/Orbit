import { getProfileStats } from "@/lib/actions/profile";
import { ProfileForm } from "@/components/profile-form";
import { MobileNav } from "@/components/mobile-nav";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const data = await getProfileStats();
  if (!data) redirect("/login");

  const { user, total, offers, interviews } = data;

  const memberSince = new Date(user.createdAt).toLocaleDateString([], {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your account settings
          </p>
        </div>

        {/* Account summary card */}
        <div className="border rounded-xl p-5">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Member since {memberSince}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Applications</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{interviews}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Interviews</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{offers}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Offers</p>
            </div>
          </div>
        </div>

        {/* Edit forms */}
        <ProfileForm user={{ name: user.name, email: user.email }} />
      </div>
      <MobileNav />
    </>
  );
}
