"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import NotificationCenter from "@/components/NotificationCenter";   
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileClock,
  History,
  LayoutDashboard,
  LogOut,
  Package,
  Search,
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";

const API = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";
type Tab =
  | "dashboard"
  | "resources"
  | "requests"
  | "lending"
  | "match"
  | "forecast"
  | "history"
  | "audit"
  | "analytics";

type Hospital = {
  id: string;
  name: string;
  city: string;
  beds: number;
  totalBeds: number;
  bloodUnits: number;
  emergencyCapacity: number;
};

type Resource = {
  id: string;
  hospitalId: string;
  name: string;
  type: string;
  available: number;
  total: number;
  status: string;
};

type Request = {
  id: string;
  hospital: string;
  resource: string;
  quantity: number;
  urgency: string;
  status: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Lending = {
  id: string;
  fromHospital: string;
  toHospital: string;
  resource: string;
  quantity: number;
  status: string;
  requestId?: string | null;
  createdAt: string;
  updatedAt: string;
};

type ActivityItem = {
  id: string;
  type: string;
  message: string;
  hospital?: string;
  status: string;
  createdAt: string;
};

type MatchResult = {
  hospital?: string;
  hospitalId?: string;
  resource: string;
  available: number;
  requested: number;
  surplus: number;
  distanceKm?: number;
  hospitalLoad?: string;
};

export default function Home() {
  const { user, logout, ready } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [lendings, setLendings] = useState<Lending[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [realtime, setRealtime] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (ready && !user) {
      router.replace("/login");
    }
  }, [ready, user, router]);

  async function loadData() {
    try {
      setLoading(true);

      const responses = await Promise.all([
        fetch(`${API}/hospitals`),
        fetch(`${API}/resources`),
        fetch(`${API}/requests`),
        fetch(`${API}/lending`),
        fetch(`${API}/activity`),
      ]);

      if (responses.some((response) => !response.ok)) {
        throw new Error("One or more API requests failed");
      }

      const [
        hospitalsData,
        resourcesData,
        requestsData,
        lendingsData,
        activitiesData,
      ] = await Promise.all(
        responses.map((response) => response.json())
      );

      setHospitals(hospitalsData.data || []);
      setResources(resourcesData.data || []);
      setRequests(requestsData.data || []);
      setLendings(lendingsData.data || []);
      setActivities(activitiesData.data || []);
    } catch (error) {
      console.error(error);
      setNotice(
        "Unable to load NexusCare data. Please check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready || !user) return;

    loadData();

    const interval = setInterval(loadData, 10000);

    return () => clearInterval(interval);
  }, [ready, user]);

  useEffect(() => {
    if (!ready || !user) return;

    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      setRealtime(true);
    });

    socket.on("disconnect", () => {
      setRealtime(false);
    });

    socket.on("emergency-request-created", () => {
      loadData();
      setNotice(
        "New emergency request received in real time."
      );
    });

    socket.on("lending-request-created", () => {
      loadData();
      setNotice(
        "New lending request received in real time."
      );
    });

    socket.on("lending-status-updated", () => {
      loadData();
      setNotice(
        "Lending status updated in real time."
      );
    });

    socket.on("request-status-updated", () => {
      loadData();
      setNotice(
        "Emergency request status updated."
      );
    });

    socket.on("resource-updated", () => {
      loadData();
      setNotice(
        "Resource inventory updated in real time."
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [ready, user]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f3ef]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#27352f]" />
          <p className="mt-3 text-sm text-gray-500">
            Restoring session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAdmin = user.role === "ADMIN";

  const availableBeds = hospitals.reduce(
    (sum, hospital) => sum + hospital.beds,
    0
  );

  const totalBlood = hospitals.reduce(
    (sum, hospital) => sum + hospital.bloodUnits,
    0
  );

  const criticalResources = resources.filter(
    (resource) => resource.status === "CRITICAL"
  ).length;

  const activeRequests = requests.filter(
    (request) =>
      !["FULFILLED", "CLOSED", "CANCELLED"].includes(
        request.status
      )
  ).length;

  const navigation: {
    id: Tab;
    label: string;
    icon: React.ElementType;
  }[] = [
    {
      id: "dashboard",
      label: "Command Center",
      icon: LayoutDashboard,
    },
    {
      id: "resources",
      label: "Resources",
      icon: Package,
    },
    {
      id: "requests",
      label: "Emergency Requests",
      icon: AlertTriangle,
    },
    {
      id: "lending",
      label: "Resource Lending",
      icon: Truck,
    },
    {
      id: "match",
      label: "Smart Match",
      icon: Activity,
    },
    {
      id: "forecast",
      label: "Capacity Forecast",
      icon: BarChart3,
    },
    {
      id: "history",
      label: "Request History",
      icon: History,
    },
  ];

  if (isAdmin) {
    navigation.push(
      {
        id: "audit",
        label: "Audit Trail",
        icon: FileClock,
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: BarChart3,
      }
    );
  }

  const activeTitle =
    navigation.find((item) => item.id === tab)?.label ||
    "Command Center";

  function changeTab(nextTab: Tab) {
    setTab(nextTab);
    setMobileMenu(false);
    setNotice("");
  }

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-[#f4f3ef] text-[#252a27]">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-[#ddd9d1] bg-[#fbfaf7] transition-transform lg:static lg:translate-x-0 ${
            mobileMenu
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">

            <div className="flex h-20 items-center gap-3 border-b border-[#ddd9d1] px-5">
              <div className="rounded-lg bg-[#27352f] p-2.5 text-white">
                <Activity className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-lg font-bold">
                  NexusCare
                </h1>

                <p className="text-xs text-gray-500">
                  Hospital Operations
                </p>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-5">

              <NavGroup title="OPERATIONS">
                {navigation
                  .slice(0, 4)
                  .map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavButton
                        key={item.id}
                        active={tab === item.id}
                        icon={Icon}
                        label={item.label}
                        badge={
                          item.id === "requests" &&
                          activeRequests > 0
                            ? activeRequests.toString()
                            : undefined
                        }
                        onClick={() =>
                          changeTab(
                            item.id
                          )
                        }
                      />
                    );
                  })}
              </NavGroup>

              <NavGroup title="NETWORK">
                {navigation
                  .slice(4, 6)
                  .map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavButton
                        key={item.id}
                        active={tab === item.id}
                        icon={Icon}
                        label={item.label}
                        onClick={() =>
                          changeTab(
                            item.id
                          )
                        }
                      />
                    );
                  })}
              </NavGroup>

              <NavGroup title="HISTORY">
                {navigation
                  .slice(6)
                  .map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavButton
                        key={item.id}
                        active={tab === item.id}
                        icon={Icon}
                        label={item.label}
                        onClick={() =>
                          changeTab(
                            item.id
                          )
                        }
                      />
                    );
                  })}
              </NavGroup>

            </nav>

            {/* USER */}

            <div className="border-t border-[#ddd9d1] p-3">
              <div className="rounded-xl bg-white p-3">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dce5df] font-bold text-[#27352f]">
                    {user.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold">
                      {user.name}
                    </p>

                    <p className="truncate text-xs text-gray-500">
                      {isAdmin
                        ? "Network Administrator"
                        : user.hospital}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>

              </div>
            </div>

          </div>
        </aside>

        {/* MAIN */}

        <section className="min-w-0 flex-1">

          {/* MOBILE */}

          <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 lg:hidden">

            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <span className="font-bold">
                NexusCare
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setMobileMenu(!mobileMenu)
              }
              className="rounded-lg border px-3 py-2 text-sm"
            >
              Menu
            </button>

          </div>

          {/* HEADER */}

          <header className="flex items-center justify-between border-b border-[#ddd9d1] bg-white px-5 py-5 lg:px-8">

            <div>

              <p className="text-[10px] font-bold tracking-[0.18em] text-[#657168]">
                NEXUSCARE OPERATIONS
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                {activeTitle}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {isAdmin
                  ? "Network-wide coordination workspace"
                  : `${user.hospital} · Hospital coordination workspace`}
              </p>

            </div>

            <div className="flex items-center gap-3">

              <div className="hidden items-center gap-2 rounded-full bg-green-50 px-3 py-2 sm:flex">

                <span
                  className={`h-2 w-2 rounded-full ${
                    realtime
                      ? "bg-green-600"
                      : "bg-amber-500"
                  }`}
                />

                <span className="text-xs font-semibold text-green-700">
                  {realtime
                    ? "Live Network"
                    : "Connecting"}
                </span>

              </div>

              <button
                type="button"
                className="relative rounded-lg border border-gray-200 p-2.5"
              >
                <Bell className="h-4 w-4" />

                {activeRequests > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                )}
              </button>

            </div>
          </header>

          {notice && (
            <div className="mx-5 mt-5 rounded-lg border border-[#ccdacf] bg-[#eef5f0] px-4 py-3 text-sm text-[#365345] lg:mx-8">
              {notice}
            </div>
          )}

          <div className="p-5 lg:p-8">

            {tab === "dashboard" && (
              <Dashboard
                hospitals={hospitals}
                resources={resources}
                requests={requests}
                availableBeds={availableBeds}
                totalBlood={totalBlood}
                criticalResources={criticalResources}
                activeRequests={activeRequests}
                loading={loading}
                onTab={changeTab}
              />
            )}

            {tab === "resources" && (
              <Resources
                resources={resources}
                hospitals={hospitals}
              />
            )}

            {tab === "requests" && (
              <Requests
                requests={requests}
                loadData={loadData}
                defaultHospital={
                  user.hospital ||
                  "Bengaluru Central"
                }
              />
            )}

            {tab === "lending" && (
              <Lending
                lendings={lendings}
                loadData={loadData}
              />
            )}

            {tab === "match" && (
              <SmartMatch />
            )}

            {tab === "forecast" && (
              <Forecast resources={resources} />
            )}

            {tab === "history" && (
              <HistoryPage
                requests={requests}
                lendings={lendings}
              />
            )}

            {tab === "audit" && isAdmin && (
              <Audit activities={activities} />
            )}

            {tab === "analytics" && isAdmin && (
              <Analytics
                hospitals={hospitals}
                requests={requests}
                lendings={lendings}
              />
            )}

          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  hospitals,
  resources,
  requests,
  availableBeds,
  totalBlood,
  criticalResources,
  activeRequests,
  loading,
  onTab,
}: {
  hospitals: Hospital[];
  resources: Resource[];
  requests: Request[];
  availableBeds: number;
  totalBlood: number;
  criticalResources: number;
  activeRequests: number;
  loading: boolean;
  onTab: (tab: Tab) => void;
}) {
  const critical = resources.filter(
    (resource) =>
      resource.status === "CRITICAL"
  );

  return (
    <div className="mx-auto max-w-[1500px]">

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">

        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-[#657168]">
            COMMAND CENTER
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Network overview
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            A live operational view of hospital capacity,
            critical resources and emergency coordination.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onTab("requests")}
          className="rounded-lg bg-[#27352f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1f2924]"
        >
          + Emergency Request
        </button>

      </div>

      {/* METRICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Metric
          label="Available Beds"
          value={
            loading
              ? "..."
              : availableBeds.toString()
          }
          detail="Across connected hospitals"
          type="normal"
        />

        <Metric
          label="Blood Inventory"
          value={
            loading
              ? "..."
              : totalBlood.toString()
          }
          detail="Units in network"
          type="normal"
        />

        <Metric
          label="Active Requests"
          value={
            loading
              ? "..."
              : activeRequests.toString()
          }
          detail="Requires coordination"
          type="warning"
        />

        <Metric
          label="Critical Resources"
          value={
            loading
              ? "..."
              : criticalResources.toString()
          }
          detail="Immediate attention"
          type="critical"
        />

      </div>

      {/* CRITICAL */}

      <section className="mt-8">

        <div className="mb-4">
          <h2 className="text-lg font-bold">
            Requires Attention
          </h2>

          <p className="text-sm text-gray-500">
            Current resources that may need action.
          </p>
        </div>

        {critical.length === 0 ? (
          <div className="rounded-xl border border-green-200 bg-white p-5 text-sm text-green-700">
            No critical resources reported.
          </div>
        ) : (
          critical.map((resource) => (
            <div
              key={resource.id}
              className="rounded-xl border border-red-200 bg-white p-5"
            >

              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                <div className="flex items-start gap-4">

                  <div className="rounded-lg bg-red-50 p-3 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                  </div>

                  <div>

                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">
                        {resource.name}
                      </h3>

                      <StatusBadge status="CRITICAL" />
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      {resource.hospitalId}
                    </p>

                    <p className="mt-3 text-sm">
                      <strong>
                        {resource.available}
                      </strong>{" "}
                      available of{" "}
                      <strong>
                        {resource.total}
                      </strong>
                    </p>

                  </div>

                </div>

                <div className="flex flex-wrap items-center gap-3">

                  <Detail
                    label="Burn rate"
                    value="2.5 / hr"
                  />

                  <Detail
                    label="Remaining"
                    value={`${(
                      resource.available /
                      2.5
                    ).toFixed(1)} hrs`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      onTab("forecast")
                    }
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium"
                  >
                    Analyze
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onTab("match")
                    }
                    className="rounded-lg bg-[#27352f] px-4 py-2 text-sm font-medium text-white"
                  >
                    Find Supply
                  </button>

                </div>

              </div>

            </div>
          ))
        )}

      </section>

      {/* HOSPITALS */}

      <section className="mt-8">

        <div className="mb-4">
          <h2 className="text-lg font-bold">
            Hospital Network
          </h2>

          <p className="text-sm text-gray-500">
            Current operational capacity across the network.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">

          {hospitals.map((hospital) => (
            <HospitalCard
              key={hospital.id}
              hospital={hospital}
            />
          ))}

        </div>

      </section>

      {/* ACTIVE REQUESTS */}

      <section className="mt-8">

        <div className="mb-4 flex items-end justify-between">

          <div>
            <h2 className="text-lg font-bold">
              Active Emergency Requests
            </h2>

            <p className="text-sm text-gray-500">
              Requests currently moving through coordination.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onTab("history")}
            className="text-sm font-semibold text-[#4f6658]"
          >
            View history →
          </button>

        </div>

        <TableBox
          headers={[
            "Request",
            "Hospital",
            "Quantity",
            "Urgency",
            "Status",
          ]}
        >
          {requests
            .filter(
              (request) =>
                ![
                  "FULFILLED",
                  "CLOSED",
                  "CANCELLED",
                ].includes(request.status)
            )
            .slice(0, 5)
            .map((request) => (
              <RequestRow
                key={request.id}
                id={request.id}
                resource={request.resource}
                hospital={request.hospital}
                quantity={request.quantity.toString()}
                urgency={request.urgency}
                status={request.status}
              />
            ))}
        </TableBox>

      </section>

    </div>
  );
}

/* =========================================================
   REQUESTS
========================================================= */

function Requests({
  requests,
  loadData,
  defaultHospital,
}: {
  requests: Request[];
  loadData: () => Promise<void>;
  defaultHospital: string;
}) {
  const [hospital, setHospital] =
    useState(defaultHospital);

  const [resource, setResource] =
    useState("O- Blood");

  const [quantity, setQuantity] =
    useState("5");

  const [urgency, setUrgency] =
    useState("CRITICAL");

  const [description, setDescription] =
    useState("Emergency resource requirement");

  const [saving, setSaving] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  async function createRequest() {
    try {
      setSaving(true);
      setSuccess("");

      const response = await fetch(
        `${API}/requests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hospital,
            resource,
            quantity: Number(quantity),
            urgency,
            description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Request creation failed"
        );
      }

      setSuccess(
        `${data.data.id} created successfully.`
      );

      setDescription(
        "Emergency resource requirement"
      );

      await loadData();
    } catch (error) {
      console.error(error);

      setSuccess(
        "Unable to create emergency request."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageBox
      title="Emergency Requests"
      description="Create and monitor urgent hospital resource requirements."
    >

      <div className="rounded-xl border border-red-100 bg-red-50 p-5">

        <h3 className="font-bold">
          Create Emergency Request
        </h3>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">

          <select
            value={hospital}
            onChange={(e) =>
              setHospital(e.target.value)
            }
            className="rounded-lg border bg-white px-3 py-3 text-sm"
          >
            <option>
              Bengaluru Central
            </option>
            <option>
              Mysuru General
            </option>
            <option>
              Mangaluru Medical
            </option>
          </select>

          <select
            value={resource}
            onChange={(e) =>
              setResource(e.target.value)
            }
            className="rounded-lg border bg-white px-3 py-3 text-sm"
          >
            <option>O- Blood</option>
            <option>ICU Beds</option>
            <option>General Beds</option>
            <option>Ventilators</option>
          </select>

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) =>
              setQuantity(e.target.value)
            }
            className="rounded-lg border bg-white px-3 py-3 text-sm"
          />

          <select
            value={urgency}
            onChange={(e) =>
              setUrgency(e.target.value)
            }
            className="rounded-lg border bg-white px-3 py-3 text-sm"
          >
            <option>CRITICAL</option>
            <option>HIGH</option>
            <option>MEDIUM</option>
          </select>

        </div>

        <textarea
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          className="mt-3 w-full rounded-lg border bg-white px-3 py-3 text-sm outline-none"
          rows={3}
          placeholder="Reason for request..."
        />

        <button
          type="button"
          disabled={saving}
          onClick={createRequest}
          className="mt-3 rounded-lg bg-[#27352f] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving
            ? "Creating..."
            : "Create Emergency Request"}
        </button>

        {success && (
          <div className="mt-4 rounded-lg bg-white p-3 text-sm text-green-700">
            {success}
          </div>
        )}

      </div>

      <div className="mt-6">

        <TableBox
          headers={[
            "Request",
            "Resource",
            "Hospital",
            "Quantity",
            "Urgency",
            "Status",
          ]}
        >
          {requests.map((request) => (
            <tr
              key={request.id}
              className="border-t border-gray-100"
            >

              <td className="px-5 py-4 font-semibold">
                {request.id}
              </td>

              <td className="px-5 py-4">
                {request.resource}
              </td>

              <td className="px-5 py-4 text-sm">
                {request.hospital}
              </td>

              <td className="px-5 py-4">
                {request.quantity}
              </td>

              <td className="px-5 py-4">
                <StatusBadge
                  status={request.urgency}
                />
              </td>

              <td className="px-5 py-4">
                <StatusBadge
                  status={request.status}
                />
              </td>

            </tr>
          ))}
        </TableBox>

      </div>

    </PageBox>
  );
}

/* =========================================================
   SMART MATCH
========================================================= */

function SmartMatch() {
  const [resource, setResource] =
    useState("O- Blood");

  const [quantity, setQuantity] =
    useState("5");

  const [result, setResult] =
    useState<MatchResult | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [created, setCreated] =
    useState(false);

  async function findMatch() {
    try {
      setLoading(true);
      setCreated(false);
      setResult(null);

      const response = await fetch(
        `${API}/smart-match`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resource,
            quantity: Number(quantity),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Smart Match failed"
        );
      }

      if (!data.matched) {
        alert(data.message);
        return;
      }

      setResult(data.match);
    } catch (error) {
      console.error(error);
      alert("Smart Match failed.");
    } finally {
      setLoading(false);
    }
  }

  async function requestLending() {
    if (!result?.hospital) return;

    try {
      const response = await fetch(
        `${API}/lending`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromHospital: result.hospital,
            toHospital: "Bengaluru Central",
            resource,
            quantity: Number(quantity),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Lending request failed"
        );
      }

      setCreated(true);
    } catch (error) {
      console.error(error);
      alert(
        "Unable to create lending request."
      );
    }
  }

  return (
    <PageBox
      title="Smart Match"
      description="Find a viable source hospital before manually coordinating supply."
    >

      <div className="rounded-xl border border-gray-200 bg-white p-6">

        <div className="grid gap-4 md:grid-cols-3">

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Resource
            </label>

            <select
              value={resource}
              onChange={(e) =>
                setResource(e.target.value)
              }
              className="w-full rounded-lg border px-3 py-3"
            >
              <option>O- Blood</option>
              <option>ICU Beds</option>
              <option>General Beds</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Quantity
            </label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value)
              }
              className="w-full rounded-lg border px-3 py-3"
            />
          </div>

          <div className="flex items-end">

            <button
              type="button"
              onClick={findMatch}
              disabled={loading}
              className="w-full rounded-lg bg-[#27352f] px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading
                ? "Searching..."
                : "Find Smart Match"}
            </button>

          </div>

        </div>

      </div>

      {result && (
        <div className="mt-6 rounded-xl border border-[#ced9d2] bg-white p-6">

          <div className="flex flex-col justify-between gap-4 md:flex-row">

            <div>

              <p className="text-xs font-bold tracking-[0.15em] text-[#657168]">
                RECOMMENDED SOURCE
              </p>

              <h3 className="mt-1 text-2xl font-bold">
                {result.hospital}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {result.resource}
              </p>

            </div>

            <StatusBadge status="AVAILABLE" />

          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">

            <Detail
              label="Available"
              value={result.available.toString()}
            />

            <Detail
              label="Requested"
              value={result.requested.toString()}
            />

            <Detail
              label="Surplus"
              value={result.surplus.toString()}
            />

            <Detail
              label="Distance"
              value={`${result.distanceKm ?? "-"} km`}
            />

          </div>

          <div className="mt-5 rounded-lg bg-[#f7f6f2] p-4">

            <p className="font-semibold">
              Why this match?
            </p>

            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p>
                ✓ Sufficient resource surplus
              </p>
              <p>
                ✓ Hospital load:{" "}
                {result.hospitalLoad || "MEDIUM"}
              </p>
              <p>
                ✓ Network source identified
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={requestLending}
            className="mt-5 rounded-lg bg-[#27352f] px-5 py-3 font-semibold text-white"
          >
            Request Resource Lending
          </button>

          {created && (
            <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              Lending request created. Open Resource Lending to continue the transfer workflow.
            </div>
          )}

        </div>
      )}

    </PageBox>
  );
}

/* =========================================================
   LENDING
========================================================= */

function Lending({
  lendings,
  loadData,
}: {
  lendings: Lending[];
  loadData: () => Promise<void>;
}) {
  const [workingId, setWorkingId] =
    useState<string | null>(null);

  async function updateLending(
    id: string,
    action: "accept" | "complete" | "cancel"
  ) {
    try {
      setWorkingId(id);

      const response = await fetch(
        `${API}/lending/${id}/${action}`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Lending update failed"
        );
      }

      await loadData();
    } catch (error) {
      console.error(error);
      alert(
        "Unable to update lending transaction."
      );
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <PageBox
      title="Resource Lending"
      description="Track resource sharing between connected hospitals."
    >

      {lendings.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
          No lending transactions yet.
        </div>
      )}

      <div className="space-y-4">

        {lendings.map((lending) => (
          <div
            key={lending.id}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >

            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <p className="text-xs font-bold tracking-wide text-gray-400">
                  {lending.id}
                </p>

                <h3 className="mt-1 text-lg font-bold">
                  {lending.fromHospital}
                  {" → "}
                  {lending.toHospital}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {lending.resource} ·{" "}
                  {lending.quantity} units
                </p>

              </div>

              <div className="flex flex-wrap items-center gap-3">

                <StatusBadge
                  status={lending.status}
                />

                {lending.status ===
                  "REQUESTED" && (
                  <>
                    <button
                      type="button"
                      disabled={
                        workingId ===
                        lending.id
                      }
                      onClick={() =>
                        updateLending(
                          lending.id,
                          "accept"
                        )
                      }
                      className="rounded-lg bg-[#27352f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Accept
                    </button>

                    <button
                      type="button"
                      disabled={
                        workingId ===
                        lending.id
                      }
                      onClick={() =>
                        updateLending(
                          lending.id,
                          "cancel"
                        )
                      }
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
                    >
                      Reject
                    </button>
                  </>
                )}

                {lending.status ===
                  "ACCEPTED" && (
                  <button
                    type="button"
                    disabled={
                      workingId === lending.id
                    }
                    onClick={() =>
                      updateLending(
                        lending.id,
                        "complete"
                      )
                    }
                    className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Mark Received
                  </button>
                )}

              </div>

            </div>

          </div>
        ))}

      </div>

      <div className="mt-8">

        <h3 className="mb-4 text-lg font-bold">
          Lending History
        </h3>

        <TableBox
          headers={[
            "Transaction",
            "From",
            "To",
            "Resource",
            "Quantity",
            "Status",
          ]}
        >
          {lendings.map((lending) => (
            <tr
              key={lending.id}
              className="border-t border-gray-100"
            >

              <td className="px-5 py-4 font-semibold">
                {lending.id}
              </td>

              <td className="px-5 py-4 text-sm">
                {lending.fromHospital}
              </td>

              <td className="px-5 py-4 text-sm">
                {lending.toHospital}
              </td>

              <td className="px-5 py-4 text-sm">
                {lending.resource}
              </td>

              <td className="px-5 py-4 text-sm">
                {lending.quantity}
              </td>

              <td className="px-5 py-4">
                <StatusBadge
                  status={lending.status}
                />
              </td>

            </tr>
          ))}
        </TableBox>

      </div>
    </PageBox>
  );
}

/* =========================================================
   REQUEST HISTORY + TIMELINE
========================================================= */

function HistoryPage({
  requests,
  lendings,
}: {
  requests: Request[];
  lendings: Lending[];
}) {
  const [filter, setFilter] =
    useState("ALL");

  const [selectedRequest, setSelectedRequest] =
    useState<Request | null>(null);

  const filtered =
    filter === "ALL"
      ? requests
      : requests.filter(
          (request) =>
            request.status === filter
        );

  return (
    <PageBox
      title="Request History"
      description="Track previous emergency requests and their lifecycle."
    >

      <div className="mb-5 flex flex-wrap gap-2">

        {[
          "ALL",
          "PENDING",
          "MATCHED",
          "FULFILLED",
          "CLOSED",
          "CANCELLED",
        ].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() =>
              setFilter(item)
            }
            className={`rounded-full px-4 py-2 text-xs font-semibold ${
              filter === item
                ? "bg-[#27352f] text-white"
                : "border border-gray-200 bg-white"
            }`}
          >
            {item}
          </button>
        ))}

      </div>

      <TableBox
        headers={[
          "Request",
          "Resource",
          "Hospital",
          "Quantity",
          "Urgency",
          "Status",
          "Action",
        ]}
      >
        {filtered.map((request) => (
          <tr
            key={request.id}
            className="border-t border-gray-100"
          >

            <td className="px-5 py-4 font-semibold">
              {request.id}
            </td>

            <td className="px-5 py-4">
              {request.resource}
            </td>

            <td className="px-5 py-4 text-sm">
              {request.hospital}
            </td>

            <td className="px-5 py-4">
              {request.quantity}
            </td>

            <td className="px-5 py-4">
              <StatusBadge
                status={request.urgency}
              />
            </td>

            <td className="px-5 py-4">
              <StatusBadge
                status={request.status}
              />
            </td>

            <td className="px-5 py-4">
              <button
                type="button"
                onClick={() =>
                  setSelectedRequest(
                    request
                  )
                }
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold"
              >
                View Timeline
              </button>
            </td>

          </tr>
        ))}
      </TableBox>

      {selectedRequest && (
        <RequestTimeline
          request={selectedRequest}
          lendings={lendings}
          onClose={() =>
            setSelectedRequest(null)
          }
        />
      )}

    </PageBox>
  );
}

function RequestTimeline({
  request,
  lendings,
  onClose,
}: {
  request: Request;
  lendings: Lending[];
  onClose: () => void;
}) {
  const relatedLending =
    lendings.find(
      (lending) =>
        lending.requestId === request.id
    );

  const isMatched =
    ["MATCHED", "FULFILLED"].includes(
      request.status
    );

  const isFulfilled =
    request.status === "FULFILLED" ||
    relatedLending?.status ===
      "COMPLETED";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-5">

      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">

        <div className="flex items-start justify-between">

          <div>
            <p className="text-xs font-bold tracking-wide text-gray-400">
              REQUEST LIFECYCLE
            </p>

            <h3 className="mt-1 text-2xl font-bold">
              {request.id}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {request.resource} ·{" "}
              {request.hospital}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            Close
          </button>

        </div>

        <div className="mt-8 space-y-6">

          <TimelineStep
            title="Request Created"
            description={`Request for ${request.quantity} ${request.resource}`}
            done
          />

          <TimelineStep
            title="Smart Match"
            description={
              isMatched
                ? "A potential source hospital has been identified."
                : "Waiting for source hospital matching."
            }
            done={isMatched}
          />

          <TimelineStep
            title="Resource Lending"
            description={
              relatedLending
                ? `${relatedLending.fromHospital} → ${relatedLending.toHospital}`
                : "Lending transaction not created yet."
            }
            done={Boolean(relatedLending)}
          />

          <TimelineStep
            title="Resource Received"
            description={
              isFulfilled
                ? "Resource transfer completed."
                : "Awaiting resource receipt."
            }
            done={isFulfilled}
          />

          <TimelineStep
            title="Request Fulfilled"
            description={
              request.status === "FULFILLED"
                ? "Emergency request completed."
                : "Request remains active."
            }
            done={
              request.status === "FULFILLED"
            }
            last
          />

        </div>

      </div>
    </div>
  );
}

function TimelineStep({
  title,
  description,
  done,
  last = false,
}: {
  title: string;
  description: string;
  done: boolean;
  last?: boolean;
}) {
  return (
    <div className="flex gap-4">

      <div className="flex flex-col items-center">

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            done
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {done ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Clock3 className="h-5 w-5" />
          )}
        </div>

        {!last && (
          <div
            className={`mt-1 h-8 w-px ${
              done
                ? "bg-green-200"
                : "bg-gray-200"
            }`}
          />
        )}

      </div>

      <div className="pt-1">

        <p className="font-semibold">
          {title}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   RESOURCES
========================================================= */

function Resources({
  resources,
  hospitals,
}: {
  resources: Resource[];
  hospitals: Hospital[];
}) {
  const [search, setSearch] =
    useState("");

  const filtered = useMemo(() => {
    return resources.filter((resource) => {
      const hospital =
        getHospitalName(
          hospitals,
          resource.hospitalId
        );

      return (
        resource.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        hospital
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
      );
    });
  }, [resources, hospitals, search]);

  return (
    <PageBox
      title="Resource Inventory"
      description="Monitor resource availability across the network."
    >

      <div className="mb-5">

        <div className="relative max-w-md">

          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none"
            placeholder="Search resource or hospital..."
          />

        </div>

      </div>

      <TableBox
        headers={[
          "Resource",
          "Hospital",
          "Available",
          "Capacity",
          "Status",
        ]}
      >

        {filtered.map((resource) => (
          <ResourceRow
            key={resource.id}
            resource={resource.name}
            hospital={getHospitalName(
              hospitals,
              resource.hospitalId
            )}
            available={resource.available.toString()}
            capacity={resource.total.toString()}
            status={resource.status}
          />
        ))}

      </TableBox>

    </PageBox>
  );
}

/* =========================================================
   FORECAST
========================================================= */

function Forecast({
  resources,
}: {
  resources: Resource[];
}) {
  const critical = resources.filter(
    (resource) =>
      resource.status === "CRITICAL"
  );

  return (
    <PageBox
      title="Capacity Forecast"
      description="Projected resource availability using current consumption rate."
    >

      <div className="grid gap-5 lg:grid-cols-2">

        {critical.map((resource) => {

          const hours =
            resource.available / 2.5;

          const percentage =
            (resource.available /
              resource.total) *
            100;

          return (
            <div
              key={resource.id}
              className="rounded-xl border border-red-200 bg-white p-6"
            >

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-xs font-bold tracking-wide text-gray-400">
                    PREDICTIVE CAPACITY
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    {resource.name}
                  </h3>
                </div>

                <StatusBadge status="CRITICAL" />

              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">

                <Detail
                  label="Available"
                  value={`${resource.available}`}
                />

                <Detail
                  label="Burn rate"
                  value="2.5 / hr"
                />

                <Detail
                  label="Estimated"
                  value={`${hours.toFixed(1)} hrs`}
                />

              </div>

              <div className="mt-6">

                <div className="mb-2 flex justify-between text-xs text-gray-500">
                  <span>
                    Current capacity
                  </span>

                  <span>
                    {Math.round(
                      percentage
                    )}
                    %
                  </span>
                </div>

                <div className="h-3 rounded-full bg-gray-100">

                  <div
                    className="h-3 rounded-full bg-red-500"
                    style={{
                      width: `${Math.max(
                        2,
                        percentage
                      )}%`,
                    }}
                  />

                </div>

              </div>

              <div className="mt-5 rounded-lg bg-red-50 p-4">

                <p className="text-sm font-bold text-red-800">
                  Recommended action
                </p>

                <p className="mt-1 text-sm text-red-700">
                  Identify network supply before capacity becomes unavailable.
                </p>

              </div>

            </div>
          );
        })}

      </div>

    </PageBox>
  );
}

/* =========================================================
   AUDIT
========================================================= */

function Audit({
  activities,
}: {
  activities: ActivityItem[];
}) {
  return (
    <PageBox
      title="Audit Trail"
      description="Operational history for accountability and traceability."
    >

      <div className="space-y-3">

        {activities.map((activity) => (
          <div
            key={activity.id}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >

            <div className="flex gap-4">

              <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#64796b]" />

              <div className="flex-1">

                <div className="flex flex-col justify-between gap-3 md:flex-row">

                  <div>

                    <p className="font-semibold">
                      {activity.message}
                    </p>

                    {activity.hospital && (
                      <p className="mt-1 text-sm text-gray-500">
                        {activity.hospital}
                      </p>
                    )}

                  </div>

                  <div className="flex items-center gap-3">

                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold">
                      {activity.status}
                    </span>

                    <span className="text-xs text-gray-400">
                      {new Date(
                        activity.createdAt
                      ).toLocaleTimeString()}
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>
        ))}

      </div>

    </PageBox>
  );
}

/* =========================================================
   ANALYTICS
========================================================= */

function Analytics({
  hospitals,
  requests,
  lendings,
}: {
  hospitals: Hospital[];
  requests: Request[];
  lendings: Lending[];
}) {
  const fulfilled =
    requests.filter(
      (request) =>
        request.status ===
          "FULFILLED" ||
        request.status === "CLOSED"
    ).length;

  const rate =
    requests.length > 0
      ? Math.round(
          (fulfilled /
            requests.length) *
            100
        )
      : 0;

  return (
    <PageBox
      title="Network Analytics"
      description="Operational indicators across connected hospitals."
    >

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <AnalyticsCard
          title="Hospitals"
          value={hospitals.length.toString()}
        />

        <AnalyticsCard
          title="Requests"
          value={requests.length.toString()}
        />

        <AnalyticsCard
          title="Resolution Rate"
          value={`${rate}%`}
        />

        <AnalyticsCard
          title="Lending"
          value={lendings.length.toString()}
        />

      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">

        <h3 className="font-bold">
          Hospital Utilization
        </h3>

        <div className="mt-6 space-y-6">

          {hospitals.map((hospital) => {

            const utilization =
              ((hospital.totalBeds -
                hospital.beds) /
                hospital.totalBeds) *
              100;

            return (
              <div key={hospital.id}>

                <div className="flex justify-between text-sm">

                  <span>
                    {hospital.name}
                  </span>

                  <span className="font-semibold">
                    {Math.round(
                      utilization
                    )}
                    %
                  </span>

                </div>

                <div className="mt-2 h-2 rounded-full bg-gray-100">

                  <div
                    className="h-2 rounded-full bg-[#64796b]"
                    style={{
                      width: `${utilization}%`,
                    }}
                  />

                </div>

              </div>
            );
          })}

        </div>

      </div>

    </PageBox>
  );
}

/* =========================================================
   SHARED UI
========================================================= */

function NavGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-7">

      <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.18em] text-gray-400">
        {title}
      </p>

      <div className="space-y-1">
        {children}
      </div>

    </div>
  );
}

function NavButton({
  active,
  icon: Icon,
  label,
  badge,
  onClick,
}: {
  active: boolean;
  icon: React.ElementType;
  label: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
        active
          ? "bg-[#e3ebe6] font-semibold text-[#27352f]"
          : "text-gray-600 hover:bg-[#efeee9]"
      }`}
    >
      <Icon className="h-[18px] w-[18px]" />

      <span>{label}</span>

      {badge && (
        <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
          {badge}
        </span>
      )}

    </button>
  );
}

function Metric({
  label,
  value,
  detail,
  type,
}: {
  label: string;
  value: string;
  detail: string;
  type: "normal" | "warning" | "critical";
}) {
  const dot =
    type === "normal"
      ? "bg-green-600"
      : type === "warning"
      ? "bg-amber-500"
      : "bg-red-600";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">

      <div className="flex items-center justify-between">

        <p className="text-sm text-gray-500">
          {label}
        </p>

        <span
          className={`h-2.5 w-2.5 rounded-full ${dot}`}
        />

      </div>

      <p className="mt-4 text-3xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {detail}
      </p>

    </div>
  );
}

function HospitalCard({
  hospital,
}: {
  hospital: Hospital;
}) {
  const utilization =
    ((hospital.totalBeds -
      hospital.beds) /
      hospital.totalBeds) *
    100;

  const attention =
    utilization >= 70;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">

      <div className="flex items-start justify-between">

        <div>
          <h3 className="font-bold">
            {hospital.name}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {hospital.city}
          </p>
        </div>

        <StatusBadge
          status={
            attention
              ? "WARNING"
              : "AVAILABLE"
          }
        />

      </div>

      <div className="mt-6">

        <div className="flex justify-between text-xs text-gray-500">

          <span>
            Bed utilization
          </span>

          <span>
            {Math.round(
              utilization
            )}
            %
          </span>

        </div>

        <div className="mt-2 h-2 rounded-full bg-gray-100">

          <div
            className="h-2 rounded-full bg-[#64796b]"
            style={{
              width: `${utilization}%`,
            }}
          />

        </div>

      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">

        <Detail
          label="Available beds"
          value={hospital.beds.toString()}
        />

        <Detail
          label="Blood units"
          value={hospital.bloodUnits.toString()}
        />

      </div>

    </div>
  );
}

function RequestRow({
  id,
  resource,
  hospital,
  quantity,
  urgency,
  status,
}: {
  id: string;
  resource: string;
  hospital: string;
  quantity: string;
  urgency: string;
  status: string;
}) {
  return (
    <tr className="border-t border-gray-100">

      <td className="px-5 py-4">

        <p className="font-semibold">
          {resource}
        </p>

        <p className="text-xs text-gray-500">
          {id}
        </p>

      </td>

      <td className="px-5 py-4 text-sm">
        {hospital}
      </td>

      <td className="px-5 py-4">
        {quantity}
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={urgency} />
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={status} />
      </td>

    </tr>
  );
}

function ResourceRow({
  resource,
  hospital,
  available,
  capacity,
  status,
}: {
  resource: string;
  hospital: string;
  available: string;
  capacity: string;
  status: string;
}) {
  return (
    <tr className="border-t border-gray-100">

      <td className="px-5 py-4 font-semibold">
        {resource}
      </td>

      <td className="px-5 py-4 text-sm">
        {hospital}
      </td>

      <td className="px-5 py-4">
        {available}
      </td>

      <td className="px-5 py-4">
        {capacity}
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={status} />
      </td>

    </tr>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    CRITICAL:
      "bg-red-50 text-red-700",
    HIGH:
      "bg-amber-50 text-amber-700",
    WARNING:
      "bg-amber-50 text-amber-700",
    PENDING:
      "bg-amber-50 text-amber-700",
    REQUESTED:
      "bg-amber-50 text-amber-700",
    MATCHED:
      "bg-blue-50 text-blue-700",
    ACCEPTED:
      "bg-blue-50 text-blue-700",
    AVAILABLE:
      "bg-green-50 text-green-700",
    COMPLETED:
      "bg-green-50 text-green-700",
    FULFILLED:
      "bg-green-50 text-green-700",
    CLOSED:
      "bg-gray-100 text-gray-700",
    CANCELLED:
      "bg-gray-100 text-gray-700",
    RECORDED:
      "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
        styles[status] ||
        "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

function PageBox({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[1500px]">

      <div className="mb-7">

        <h1 className="text-3xl font-bold">
          {title}
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          {description}
        </p>

      </div>

      {children}

    </div>
  );
}

function TableBox({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

      <div className="overflow-x-auto">

        <table className="w-full min-w-[700px] text-left">

          <thead className="bg-[#faf9f6]">

            <tr>

              {headers.map((header) => (
                <th
                  key={header}
                  className="px-5 py-4 text-xs uppercase tracking-wide text-gray-500"
                >
                  {header}
                </th>
              ))}

            </tr>

          </thead>

          <tbody>
            {children}
          </tbody>

        </table>

      </div>

    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-[#f7f6f2] p-3">

      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-semibold">
        {value}
      </p>

    </div>
  );
}

function AnalyticsCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold">
        {value}
      </p>

    </div>
  );
}

function getHospitalName(
  hospitals: Hospital[],
  id: string
) {
  return (
    hospitals.find(
      (hospital) =>
        hospital.id === id
    )?.name || id
  );
}