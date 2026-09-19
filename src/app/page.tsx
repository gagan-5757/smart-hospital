import {
  Activity,
  AlertTriangle,
  Bed,
  Droplets,
  Hospital,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
            <Hospital size={26} />
          </div>

          <div>
            <h1 className="text-xl font-bold">
              Smart Hospital Command Center
            </h1>
            <p className="text-sm text-slate-400">
              Real-time hospital resource coordination
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="p-6">
        <div className="mb-8">
          <p className="text-sm font-medium text-cyan-400">
            HEALTHCARE OPERATIONS
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Network Resource Overview
          </h2>

          <p className="mt-2 text-slate-400">
            Monitor critical resources across connected hospital branches.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <Bed className="text-cyan-400" size={24} />
            <p className="mt-4 text-sm text-slate-400">Available Beds</p>
            <h3 className="mt-1 text-3xl font-bold">124</h3>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <Droplets className="text-red-400" size={24} />
            <p className="mt-4 text-sm text-slate-400">Blood Units</p>
            <h3 className="mt-1 text-3xl font-bold">87</h3>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <Activity className="text-emerald-400" size={24} />
            <p className="mt-4 text-sm text-slate-400">
              Emergency Capacity
            </p>
            <h3 className="mt-1 text-3xl font-bold">72%</h3>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <AlertTriangle className="text-red-400" size={24} />
            <p className="mt-4 text-sm text-slate-400">Critical Alerts</p>
            <h3 className="mt-1 text-3xl font-bold text-red-400">3</h3>
          </div>
        </div>

        {/* Coming modules */}
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-semibold">AI Capacity Prediction</h3>

            <p className="mt-2 text-sm text-slate-400">
              Predict upcoming resource shortages using recent demand and
              resource burn rate.
            </p>

            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm font-semibold text-red-400">
                ICU capacity warning
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Bengaluru Central — current utilization 92%
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-lg font-semibold">
              Emergency Resource Requests
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Coordinate critical resource requests between hospital
              branches.
            </p>

            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">O− Blood</p>
                  <p className="text-xs text-slate-500">
                    Bengaluru Central
                  </p>
                </div>

                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
                  5 Units
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}