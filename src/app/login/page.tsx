"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Activity,
  Building2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState(
    "admin@nexuscare.com"
  );

  const [password, setPassword] = useState(
    "admin123"
  );

  const [error, setError] = useState("");

  function handleLogin() {
    setError("");

    const success = login(
      email.trim(),
      password
    );

    if (!success) {
      setError("Invalid email or password.");
      return;
    }

    router.replace("/");
  }

  function useAdmin() {
    setEmail("admin@nexuscare.com");
    setPassword("admin123");
    setError("");
  }

  function useCoordinator() {
    setEmail("coordinator@nexuscare.com");
    setPassword("coord123");
    setError("");
  }

  return (
    <main className="min-h-screen bg-[#f3f1eb] text-[#252a27]">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT */}
        <section className="hidden bg-[#27352f] p-12 text-white lg:flex lg:flex-col lg:justify-between">

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/10 p-3">
              <Activity className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                NexusCare
              </h1>

              <p className="text-sm text-white/60">
                Hospital Resource Coordination
              </p>
            </div>
          </div>

          <div className="max-w-xl">

            <p className="text-xs font-semibold tracking-[0.2em] text-white/50">
              NETWORK OPERATIONS
            </p>

            <h2 className="mt-4 text-5xl font-bold leading-tight">
              Coordinate critical hospital resources.
            </h2>

            <p className="mt-6 max-w-lg text-base leading-7 text-white/65">
              Monitor capacity, respond to shortages,
              coordinate emergency requests and share
              resources across connected hospitals.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <Building2 className="h-5 w-5" />
                <p className="mt-3 font-semibold">
                  Network View
                </p>
                <p className="mt-1 text-xs text-white/50">
                  Connected hospital capacity
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <ShieldCheck className="h-5 w-5" />
                <p className="mt-3 font-semibold">
                  Coordinated Response
                </p>
                <p className="mt-1 text-xs text-white/50">
                  Emergency resource workflows
                </p>
              </div>

            </div>
          </div>

          <p className="text-xs text-white/40">
            NexusCare Operations Platform
          </p>

        </section>

        {/* RIGHT */}
        <section className="flex items-center justify-center px-6 py-10">

          <div className="w-full max-w-md">

            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#27352f] p-2.5 text-white">
                  <Activity className="h-5 w-5" />
                </div>

                <div>
                  <h1 className="font-bold text-xl">
                    NexusCare
                  </h1>

                  <p className="text-xs text-gray-500">
                    Hospital Operations
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs font-bold tracking-[0.16em] text-[#657168]">
              SECURE ACCESS
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Sign in
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Access your hospital coordination workspace.
            </p>

            <div className="mt-8 space-y-5">

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Email address
                </label>

                <div className="flex items-center rounded-lg border border-[#d9d6ce] bg-white px-3">
                  <Mail className="h-4 w-4 text-gray-400" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    className="w-full bg-transparent px-3 py-3 outline-none"
                    placeholder="Enter email"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Password
                </label>

                <div className="flex items-center rounded-lg border border-[#d9d6ce] bg-white px-3">
                  <LockKeyhole className="h-4 w-4 text-gray-400" />

                  <input
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleLogin();
                      }
                    }}
                    className="w-full bg-transparent px-3 py-3 outline-none"
                    placeholder="Enter password"
                  />
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* LOGIN */}
              <button
                type="button"
                onClick={handleLogin}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#27352f] px-4 py-3 font-semibold text-white transition hover:bg-[#1f2924]"
              >
                <ShieldCheck className="h-4 w-4" />
                Sign In
              </button>

            </div>

            {/* DEMO ACCOUNTS */}
            <div className="mt-8 rounded-xl border border-[#ddd9d0] bg-white p-4">

              <p className="text-sm font-bold">
                Demo access
              </p>

              <button
                type="button"
                onClick={useAdmin}
                className="mt-4 w-full rounded-lg bg-[#f5f4ef] p-3 text-left hover:bg-[#eceae3]"
              >
                <p className="text-sm font-semibold">
                  Network Admin
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  admin@nexuscare.com
                </p>

                <p className="text-xs text-gray-500">
                  Password: admin123
                </p>
              </button>

              <button
                type="button"
                onClick={useCoordinator}
                className="mt-3 w-full rounded-lg bg-[#f5f4ef] p-3 text-left hover:bg-[#eceae3]"
              >
                <p className="text-sm font-semibold">
                  Hospital Coordinator
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  coordinator@nexuscare.com
                </p>

                <p className="text-xs text-gray-500">
                  Password: coord123
                </p>
              </button>

            </div>

          </div>
        </section>
      </div>
    </main>
  );
}
