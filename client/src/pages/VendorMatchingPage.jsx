import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Store,
  FileText,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import VendorMatching from "../components/VendorMatching";

const VendorMatchingPage = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Back navigation */}
        <button
          onClick={() => navigate(`/events/${eventId}`)}
          className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors mb-6"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to Event
        </button>

        {/* Header */}
        <section className="relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
          <div className="absolute -top-24 -right-24 w-56 h-56 bg-purple-100 rounded-full blur-3xl opacity-60" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center">
                <Store className="text-purple-600" size={27} />
              </div>

              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-purple-600 mb-2">
                  <Sparkles size={14} />
                  AI VENDOR MATCHING
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Matching Vendors
                </h1>

                <p className="text-slate-500 mt-2 max-w-2xl">
                  Discover vendors matched to your event type, location, guest
                  count, budget, and planning preferences.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 border border-purple-100 text-sm text-purple-700">
                <CheckCircle2 size={16} />
                Smart Matching
              </div>
            </div>
          </div>
        </section>

        {/* Vendor Matching */}
        <VendorMatching eventId={eventId} />

        {/* Bottom navigation */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => navigate(`/events/${eventId}/timeline`)}
            className="group flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-400 transition-all"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Back to Timeline
          </button>

          <button
            onClick={() => navigate(`/events/${eventId}`)}
            className="group flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm hover:shadow transition-all"
          >
            <FileText size={18} />
            Event Overview
            <ArrowRight
              size={17}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorMatchingPage;
