import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiLoader, FiAlertCircle } from "react-icons/fi";

const AIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAIData();
  }, []);

  const fetchAIData = async () => {
    setLoading(true);
    try {
      // Fetch insights, recommendations, and predictions in parallel
      const [insightsRes, recsRes, predRes] = await Promise.all([
        axios.get("/ai/insights"),
        axios.get("/ai/recommendations"),
        axios.get("/ai/predict"),
      ]);

      setInsights(insightsRes.data);
      setRecommendations(recsRes.data.recommendations || []);
      setPrediction(predRes.data);
    } catch (err) {
      console.error("Error fetching AI data:", err);
      setError("Failed to load AI insights");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <FiLoader className="animate-spin text-primary-600" size={24} />
          <p className="text-slate-500 text-sm">Loading AI insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 text-amber-600">
          <FiAlertCircle size={20} />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      {insights?.insights && insights.insights.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>📊</span>
              AI Insights
              <span className="ml-auto text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                {insights.insights.length} metrics
              </span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6">
            {insights.insights.map((insight, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-primary-300 hover:shadow-md transition-all duration-300 group overflow-hidden relative animate-fade-in"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-4xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 transform-gpu">
                    {insight.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      {insight.title}
                    </p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                      {insight.value}
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary-400 to-indigo-400 w-0 group-hover:w-full transition-all duration-500 ease-out"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predictions */}
      {prediction && prediction.predicted > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-indigo-200 shadow-lg p-7 hover:shadow-xl transition-shadow duration-300 group">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex-shrink-0 text-6xl group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
              📈
            </div>

            <div className="flex-1">
              <div className="mb-5">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Spending Forecast
                </h3>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-4xl font-black text-indigo-600">
                    ₹{prediction.predicted.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-slate-600">
                    by month end
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold ml-auto md:ml-0">
                    {Math.round(prediction.confidence * 100)}% accuracy
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-indigo-200/50">
                  <p className="text-xs font-medium text-slate-600 mb-1">
                    Current
                  </p>
                  <p className="text-lg font-bold text-indigo-600">
                    ₹{prediction.totalSoFar.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-blue-200/50">
                  <p className="text-xs font-medium text-slate-600 mb-1">
                    Daily Avg
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    ₹{prediction.dailyAverage}
                  </p>
                </div>
                <div className="bg-white/70 backdrop-blur rounded-lg p-4 border border-cyan-200/50">
                  <p className="text-xs font-medium text-slate-600 mb-1">
                    Days Left
                  </p>
                  <p className="text-lg font-bold text-cyan-600">
                    {prediction.daysRemaining}d
                  </p>
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-slate-700">
                    Prediction Confidence
                  </p>
                  <p className="text-sm font-bold text-indigo-600">
                    {Math.round(prediction.confidence * 100)}%
                  </p>
                </div>
                <div className="w-full bg-slate-300/50 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-indigo-600 transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.min(prediction.confidence * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>💡</span>
              Smart Recommendations
              <span className="ml-auto text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                {recommendations.length} tips
              </span>
            </h3>
          </div>
          <div className="space-y-4 p-6">
            {recommendations.map((rec, idx) => {
              const getIcon = () => {
                if (rec.type === "budget_warning") return "⚠️";
                if (rec.type === "high_spend") return "🎯";
                if (rec.type === "projection") return "📈";
                if (rec.type === "on_track") return "✅";
                return "💡";
              };

              const getcolor = () => {
                if (rec.type === "budget_warning")
                  return {
                    bg: "bg-red-50",
                    border: "border-red-200",
                    icon: "text-red-600",
                    accent: "from-red-400 to-red-600",
                  };
                if (rec.type === "high_spend")
                  return {
                    bg: "bg-orange-50",
                    border: "border-orange-200",
                    icon: "text-orange-600",
                    accent: "from-orange-400 to-red-500",
                  };
                if (rec.type === "projection")
                  return {
                    bg: "bg-amber-50",
                    border: "border-amber-200",
                    icon: "text-amber-600",
                    accent: "from-amber-400 to-orange-500",
                  };
                return {
                  bg: "bg-emerald-50",
                  border: "border-emerald-200",
                  icon: "text-emerald-600",
                  accent: "from-emerald-400 to-green-600",
                };
              };

              const colors = getcolor();

              return (
                <div
                  key={idx}
                  className={`${colors.bg} ${colors.border} border rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:border-opacity-100 group animate-fade-in`}
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`text-2xl group-hover:scale-110 transition-transform duration-300 ${colors.icon}`}
                    >
                      {getIcon()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 mb-1">
                        {rec.title}
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed mb-2">
                        {rec.description}
                      </p>

                      {/* Progress Bar for high_spend */}
                      {rec.type === "high_spend" && rec.percentage && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-slate-600">
                              Spending Level
                            </span>
                            <span className="font-bold text-orange-600">
                              {rec.percentage.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${colors.accent} transition-all duration-1000`}
                              style={{
                                width: `${Math.min(rec.percentage, 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Alert indicator for budget warning */}
                      {rec.type === "budget_warning" && (
                        <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-100 px-2.5 py-1.5 rounded-lg w-fit">
                          <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                          Action Required
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={fetchAIData}
        className="w-full py-3 px-4 bg-gradient-to-r from-primary-50 to-indigo-50 hover:from-primary-100 hover:to-indigo-100 text-primary-700 font-semibold rounded-lg transition-all duration-300 text-sm border border-primary-200 hover:shadow-md"
      >
        🔄 Refresh AI Insights
      </button>
    </div>
  );
};

export default AIInsights;
