"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Bed,
  Droplets,
  AlertTriangle,
  Building2,
  RefreshCw,
  Radio,
} from "lucide-react";

const API = "http://localhost:5000/api";

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
};

export default function Home() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      setLoading(true);

      const [hospitalRes, resourceRes, requestRes] =
        await Promise.all([
          fetch(`${API}/hospitals`),
          fetch(`${API}/resources`),
          fetch(`${API}/requests`),
        ]);

      const hospitalData = await hospitalRes.json();
      const resourceData = await resourceRes.json();
      const requestData = await requestRes.json();

      setHospitals(hospitalData.data || []);
      setResources(resourceData.data || []);
      setRequests(requestData.data || []);

      setOnline(true);
    } catch (error) {
      console.error(error);
      setOnline(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(loadDashboard, 10000);

    return () => clearInterval(interval);
  }, []);

  const totalBeds = hospitals.reduce(
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

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}

      <header className="border-b border-slate-800 bg-slate-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/10 p-2">
                <Activity className="h-7 w-7 text-cyan-400" />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  Nexus<span className="text-cyan-400">Care</span>
                </h1>

                <p className="text-xs text-slate-400">
                  Smart Hospital Resource Coordination
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 py-2">
              <Radio
                className={`h-4 w-4 ${
                  online ? "text-green-400" : "text-red-400"
                }`}
              />

              <span className="text-sm">
                {online ? "Backend Online" : "Backend Offline"}
              </span>
            </div>

            <button
              onClick={loadDashboard}
              className="rounded-lg border border-slate-700 p-2 hover:bg-slate-800"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* TITLE */}

        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-cyan-400">
            NETWORK COMMAND CENTER
          </p>

          <h2 className="text-3xl font-bold">
            Hospital Resource Overview
          </h2>

          <p className="mt-2 text-slate-400">
            Real-time coordination across connected hospital branches.
          </p>
        </div>

        {/* SUMMARY CARDS */}

        <div className="grid gap-5 md:grid-cols-4">

          <SummaryCard
            title="Available Beds"
            value={loading ? "..." : totalBeds.toString()}
            icon={<Bed />}
            description="Across network"
          />

          <SummaryCard
            title="Blood Units"
            value={loading ? "..." : totalBlood.toString()}
            icon={<Droplets />}
            description="Available inventory"
          />

          <SummaryCard
            title="Hospitals"
            value={hospitals.length.toString()}
            icon={<Building2 />}
            description="Connected branches"
          />

          <SummaryCard
            title="Critical Alerts"
            value={criticalResources.toString()}
            icon={<AlertTriangle />}
            description="Require attention"
            danger
          />

        </div>

        {/* HOSPITALS */}

        <section className="mt-10">

          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                Hospital Network
              </h3>

              <p className="text-sm text-slate-400">
                Current capacity across branches
              </p>
            </div>

            <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
              LIVE DATA
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-3">

            {hospitals.map((hospital) => {

              const utilization =
                ((hospital.totalBeds - hospital.beds) /
                  hospital.totalBeds) *
                100;

              return (
                <div
                  key={hospital.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >

                  <div className="flex items-start justify-between">

                    <div>
                      <h4 className="font-semibold">
                        {hospital.name}
                      </h4>

                      <p className="text-sm text-slate-400">
                        {hospital.city}
                      </p>
                    </div>

                    <Building2 className="h-5 w-5 text-cyan-400" />

                  </div>

                  <div className="mt-6">

                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-400">
                        Bed Utilization
                      </span>

                      <span>
                        {Math.round(utilization)}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-cyan-400"
                        style={{
                          width: `${utilization}%`,
                        }}
                      />
                    </div>

                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <div className="rounded-xl bg-slate-800 p-3">
                      <p className="text-xs text-slate-400">
                        Beds
                      </p>

                      <p className="mt-1 text-lg font-semibold">
                        {hospital.beds}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-800 p-3">
                      <p className="text-xs text-slate-400">
                        Blood Units
                      </p>

                      <p className="mt-1 text-lg font-semibold">
                        {hospital.bloodUnits}
                      </p>
                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        </section>

        {/* RESOURCES */}
<section className="mt-10">
  <div className="mb-5">
    <p className="mb-2 text-sm font-medium text-purple-400">
      PREDICTIVE CAPACITY ENGINE
    </p>
    <h3 className="text-xl font-semibold">
      Capacity Risk Analysis
    </h3>
    <p className="text-sm text-slate-400">
      Estimate how long a resource can sustain current demand.
    </p>
  </div>

  <div className="grid gap-4 md:grid-cols-2">
    {resources
      .filter((resource) => resource.status === "CRITICAL")
      .map((resource) => (
        <div
          key={resource.id}
          className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{resource.name}</h4>
              <p className="text-sm text-slate-400">
                Predictive consumption analysis
              </p>
            </div>

            <button
              onClick={async () => {
                const response = await fetch(
                  `${API}/prediction/${resource.id}`
                );

                const data = await response.json();

                alert(
                  `${data.resource}\n\n` +
                    `Available: ${data.available}\n` +
                    `Burn Rate: ${data.burnRatePerHour}/hour\n` +
                    `Predicted Remaining: ${data.predictedHoursRemaining} hours\n` +
                    `Alert: ${data.alert}`
                );
              }}
              className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-400"
            >
              Analyze Risk
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-900 p-3">
              <p className="text-xs text-slate-400">Available</p>
              <p className="mt-1 text-xl font-bold">
                {resource.available}
              </p>
            </div>

            <div className="rounded-xl bg-slate-900 p-3">
              <p className="text-xs text-slate-400">Burn Rate</p>
              <p className="mt-1 text-xl font-bold">2.5/hr</p>
            </div>

            <div className="rounded-xl bg-slate-900 p-3">
              <p className="text-xs text-slate-400">Status</p>
              <p className="mt-1 text-xl font-bold text-red-400">
                RISK
              </p>
            </div>
          </div>
        </div>
      ))}
  </div>
</section>
        <section className="mt-10">

          <div className="mb-5">
            <h3 className="text-xl font-semibold">
              Resource Availability
            </h3>

            <p className="text-sm text-slate-400">
              Critical resources requiring monitoring
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">

            {resources.map((resource) => {

              const percentage =
                (resource.available / resource.total) * 100;

              const critical =
                resource.status === "CRITICAL";

              return (
                <div
                  key={resource.id}
                  className={`rounded-2xl border p-5 ${
                    critical
                      ? "border-red-500/40 bg-red-500/5"
                      : "border-slate-800 bg-slate-900"
                  }`}
                >

                  <div className="flex items-center justify-between">

                    <div>
                      <h4 className="font-semibold">
                        {resource.name}
                      </h4>

                      <p className="text-xs text-slate-400">
                        {resource.type}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        critical
                          ? "bg-red-500/10 text-red-400"
                          : "bg-green-500/10 text-green-400"
                      }`}
                    >
                      {resource.status}
                    </span>

                  </div>

                  <div className="mt-5">

                    <div className="mb-2 flex justify-between text-sm">

                      <span className="text-slate-400">
                        Available
                      </span>

                      <span>
                        {resource.available} / {resource.total}
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                      <div
                        className={`h-full rounded-full ${
                          critical
                            ? "bg-red-500"
                            : "bg-cyan-400"
                        }`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        </section>

        {/* REQUESTS */}
        <section className="mt-10">
  <div className="mb-5">
    <p className="mb-2 text-sm font-medium text-cyan-400">
      EMERGENCY COORDINATION
    </p>
    <h3 className="text-xl font-semibold">
      Smart Resource Match
    </h3>
    <p className="text-sm text-slate-400">
      Find a connected hospital with sufficient surplus inventory.
    </p>
  </div>

  <div className="grid gap-4 md:grid-cols-3">
    <input
      id="matchResource"
      defaultValue="O- Blood"
      className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-400"
      placeholder="Resource"
    />

    <input
      id="matchQuantity"
      type="number"
      defaultValue="5"
      min="1"
      className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-cyan-400"
      placeholder="Quantity"
    />

    <button
      onClick={async () => {
        const resource = (
          document.getElementById("matchResource") as HTMLInputElement
        ).value;

        const quantity = Number(
          (document.getElementById("matchQuantity") as HTMLInputElement).value
        );

        const response = await fetch(`${API}/smart-match`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ resource, quantity }),
        });

        const data = await response.json();

        alert(
          data.matched
            ? `Smart Match Found!\nHospital: ${data.match.hospital}\nAvailable: ${data.match.available}\nSurplus after request: ${data.match.surplus}`
            : data.message
        );
      }}
      className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
    >
      Find Smart Match
    </button>
  </div>
</section>
<section className="mt-10">
  <div className="mb-5">
    <p className="mb-2 text-sm font-medium text-red-400">
      EMERGENCY RESPONSE
    </p>
    <h3 className="text-xl font-semibold">
      Create Emergency Request
    </h3>
    <p className="text-sm text-slate-400">
      Dispatch a critical resource request across the hospital network.
    </p>
  </div>

  <div className="rounded-2xl border border-red-500/20 bg-slate-900 p-5">
    <div className="grid gap-4 md:grid-cols-4">
      <input
        id="requestHospital"
        defaultValue="Bengaluru Central"
        className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-red-400"
        placeholder="Hospital"
      />

      <input
        id="requestResource"
        defaultValue="O- Blood"
        className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-red-400"
        placeholder="Resource"
      />

      <input
        id="requestQuantity"
        type="number"
        defaultValue="5"
        min="1"
        className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-red-400"
        placeholder="Quantity"
      />

      <button
        onClick={async () => {
          const hospital = (
            document.getElementById(
              "requestHospital"
            ) as HTMLInputElement
          ).value;

          const resource = (
            document.getElementById(
              "requestResource"
            ) as HTMLInputElement
          ).value;

          const quantity = Number(
            (
              document.getElementById(
                "requestQuantity"
              ) as HTMLInputElement
            ).value
          );

          const response = await fetch(`${API}/requests`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              hospital,
              resource,
              quantity,
              urgency: "CRITICAL",
            }),
          });

          const data = await response.json();

          if (data.success) {
            alert("Emergency request created successfully!");
            loadDashboard();
          } else {
            alert(data.message || "Request failed");
          }
        }}
        className="rounded-xl bg-red-500 px-5 py-3 font-semibold text-white hover:bg-red-400"
      >
        Create Emergency Request
      </button>
    </div>
  </div>
</section>
        <section className="mt-10">

          <div className="mb-5">
            <h3 className="text-xl font-semibold">
              Active Emergency Requests
            </h3>

            <p className="text-sm text-slate-400">
              Critical resource coordination queue
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="border-b border-slate-800 bg-slate-950/50">

                  <tr className="text-xs uppercase text-slate-500">

                    <th className="px-5 py-4">
                      Request
                    </th>

                    <th className="px-5 py-4">
                      Hospital
                    </th>

                    <th className="px-5 py-4">
                      Quantity
                    </th>

                    <th className="px-5 py-4">
                      Urgency
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {requests.map((request) => (

                    <tr
                      key={request.id}
                      className="border-b border-slate-800 last:border-0"
                    >

                      <td className="px-5 py-4 font-medium">
                        {request.resource}
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {request.hospital}
                      </td>

                      <td className="px-5 py-4">
                        {request.quantity}
                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            request.urgency === "CRITICAL"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-yellow-500/10 text-yellow-400"
                          }`}
                        >
                          {request.urgency}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400">
                          {request.status}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </section>

        {/* FOOTER */}

        <div className="mt-10 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">

          <div className="flex items-start gap-4">

            <Activity className="mt-1 h-5 w-5 text-cyan-400" />

            <div>

              <h4 className="font-semibold">
                NexusCare Coordination Engine
              </h4>

              <p className="mt-1 text-sm text-slate-400">
                Connected to Express API • PostgreSQL database •
                Real-time Socket.io layer ready
              </p>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  description,
  danger = false,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        danger
          ? "border-red-500/30 bg-red-500/5"
          : "border-slate-800 bg-slate-900"
      }`}
    >

      <div className="flex items-center justify-between">

        <div
          className={`rounded-xl p-3 ${
            danger
              ? "bg-red-500/10 text-red-400"
              : "bg-cyan-500/10 text-cyan-400"
          }`}
        >
          {icon}
        </div>

        {danger && (
          <AlertTriangle className="h-5 w-5 text-red-400" />
        )}

      </div>

      <p className="mt-5 text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}