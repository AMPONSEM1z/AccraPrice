"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AvatarUpload from "@/components/avatar-upload";

type UserProfile = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
};

export default function AccountPageClient() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [addressesCount, setAddressesCount] = useState<number>(0);
  const [cartCount, setCartCount] = useState<number>(0);

  // Form states
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Load user & profile
  useEffect(() => {
    let canceled = false;

    const init = async () => {
      setLoading(true);
      const {
        data: { user: authUser },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr) {
        console.error("Auth getUser error:", userErr);
      }

      if (!authUser) {
        // Not signed in -> redirect to login
        router.push("/auth/login?redirect=/account");
        return;
      }

      if (canceled) return;
      setUser(authUser);

      // Fetch user profile row and counts
      const [
        { data: userProfile },
        { count: ordersC },
        { count: addressesC },
        { count: cartC },
      ] = await Promise.all([
        supabase.from("users").select("*").eq("id", authUser.id).single(),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("user_id", authUser.id),
        supabase
          .from("addresses")
          .select("*", { count: "exact", head: true })
          .eq("user_id", authUser.id),
        supabase
          .from("cart_items")
          .select("*", { count: "exact", head: true })
          .eq("user_id", authUser.id),
      ]);

      if (canceled) return;

      setProfile(userProfile ?? { id: authUser.id, email: authUser.email });
      setNameInput(userProfile?.full_name ?? "");
      setEmailInput(authUser?.email ?? "");
      setOrdersCount(ordersC ?? 0);
      setAddressesCount(addressesC ?? 0);
      setCartCount(cartC ?? 0);

      setLoading(false);
    };

    init();

    return () => {
      canceled = true;
    };
  }, [router, supabase]);

  // Avatar preview URL helper (handles both external and stored public URLs)
  const avatarUrl = profile?.avatar_url
    ? profile.avatar_url
    : "/avatar-placeholder.png"; // fallback (make sure you have this placeholder or change)

  // Handle avatar file selection
  const onAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      // optional: validate size/type here
      setAvatarFile(file);
    }
  };

  // Upload avatar to 'avatars' bucket and update user row
  const uploadAvatarAndSave = async () => {
    if (!user || !avatarFile) return;
    setUploading(true);

    try {
      const ext = avatarFile.name.split(".").pop();
      const path = `avatars/${user.id}_${Date.now()}.${ext}`;

      // upload
      const uploadRes = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadRes.error) throw uploadRes.error;

      // get public url
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);
      const publicUrl = publicUrlData.publicUrl;

      // update users table row
      const { error: updateErr } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateErr) throw updateErr;

      setProfile((p) =>
        p
          ? { ...p, avatar_url: publicUrl }
          : { id: user.id, avatar_url: publicUrl }
      );
      alert("Avatar uploaded successfully!");
      setAvatarFile(null);
    } catch (err) {
      console.error("Upload avatar error:", err);
      alert("Failed to upload avatar. See console for details.");
    } finally {
      setUploading(false);
    }
  };

  // Save name to users table
  const saveProfileName = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ full_name: nameInput })
        .eq("id", user.id);
      if (error) throw error;
      setProfile((p) =>
        p
          ? { ...p, full_name: nameInput }
          : { id: user.id, full_name: nameInput }
      );
      alert("Profile updated.");
    } catch (err) {
      console.error("Save profile error:", err);
      alert("Failed to save profile name.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Update email via Supabase Auth
  const changeEmail = async () => {
    if (!user) return;
    if (!emailInput || emailInput === user.email) {
      alert("No email change detected.");
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ email: emailInput });
      if (error) throw error;
      alert("Email update requested. You may need to confirm via email.");
    } catch (err) {
      console.error("Change email error:", err);
      alert("Failed to change email. See console.");
    }
  };

  // Update password via Supabase Auth
  const changePassword = async () => {
    if (!user) return;
    if (!passwordInput || passwordInput.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordInput,
      });
      if (error) throw error;
      setPasswordInput("");
      alert("Password changed successfully.");
    } catch (err) {
      console.error("Change password error:", err);
      alert("Failed to change password. See console.");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your account…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} cartItemCount={cartCount || 0} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-10">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Left column: Overview */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 rounded-full overflow-hidden bg-muted">
                      {/* Use next/image for optimization if URL is allowed; fallback to img otherwise */}
                      {/* next/image requires domains in next.config.js for external URLs */}
                      <img
                        src={profile?.avatar_url ?? "/avatar-placeholder.png"}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Signed in as
                      </p>
                      <p className="font-medium">{user?.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {profile?.full_name ?? "No name set"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {ordersCount}
                      </p>
                      <p className="text-sm text-muted-foreground">Orders</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {addressesCount}
                      </p>
                      <p className="text-sm text-muted-foreground">Addresses</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {cartCount}
                      </p>
                      <p className="text-sm text-muted-foreground">In cart</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => router.push("/account/orders")}>
                      View Orders
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/account/")}
                    >
                      Manage Addresses
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Change Avatar</CardTitle>
                </CardHeader>
                <CardContent>
                  <AvatarUpload
                    userId={user.id}
                    currentAvatar={profile?.avatar_url}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right column: Settings */}
            <div className="md:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="fullName">Display name</Label>
                      <Input
                        id="fullName"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={saveProfileName} disabled={savingProfile}>
                      {savingProfile ? "Saving…" : "Save profile"}
                    </Button>
                    <Button variant="outline" onClick={changeEmail}>
                      Change email
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="password">New password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="At least 6 characters"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={changePassword}>Change password</Button>
                    <Button
                      variant="outline"
                      onClick={() => setPasswordInput("")}
                    >
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
