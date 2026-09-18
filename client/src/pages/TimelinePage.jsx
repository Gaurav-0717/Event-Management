import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckSquare,
  Users,
  Sparkles,
} from "lucide-react";

import EventTimeline from "../components/EventTimeline";

const TimelinePage = () => {
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
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-50 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <CheckSquare className="text-indigo-600" size={27} />
              </div>

              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-indigo-600 mb-2">
                  <Sparkles size={14} />
                  EVENT TIMELINE
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Timeline & Checklist
                </h1>

                <p className="text-slate-500 mt-2 max-w-2xl">
                  Organize your preparation tasks, track progress, and keep your
                  event planning on schedule.
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600">
              <CheckSquare size={17} className="text-indigo-600" />
              Stay on schedule
            </div>
          </div>
        </section>

        {/* Timeline */}
        <EventTimeline eventId={eventId} />

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => navigate(`/events/${eventId}/budget`)}
            className="group flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-400 transition-all"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Back to Budget
          </button>

          <button
            onClick={() => navigate(`/events/${eventId}/vendors`)}
            className="group flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm hover:shadow transition-all"
          >
            Find Matching Vendors
            <Users size={18} />
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

export default TimelinePage;
