import { type ReactElement } from 'react';
import type { ATSScoreResult } from '../../../types/resume.types';
import type { JobDescriptionAnalysis } from '../../../types/resume.types';

interface ATSScoreCardProps {
  atsScore: ATSScoreResult;
  jobAnalysis?: JobDescriptionAnalysis;
}

function ATSScoreCard({ atsScore }: ATSScoreCardProps): ReactElement {
  const overallScore = atsScore.job_matches[0]?.match_score || 0;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-300';
    if (score >= 60) return 'text-yellow-300';
    return 'text-red-300';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-400/10';
    if (score >= 60) return 'bg-yellow-400/10';
    return 'bg-red-400/10';
  };

  const getScoreBorderColor = (score: number) => {
    if (score >= 80) return 'border-emerald-400/30';
    if (score >= 60) return 'border-yellow-400/30';
    return 'border-red-400/30';
  };

  return (
    <section className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/70 shadow-lg backdrop-blur">
      <div className="border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
              <svg className="h-5 w-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">ATS Score</h2>
              <p className="text-sm text-slate-400">Applicant Tracking System Analysis</p>
            </div>
          </div>
          <div className={`rounded-2xl ${getScoreBgColor(overallScore)} ${getScoreBorderColor(overallScore)} border px-6 py-3`}>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </div>
              <div className="text-xs text-slate-400 mt-1">Match Score</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-sm font-semibold text-white mb-2">Summary</h3>
          <p className="text-sm text-slate-300">{atsScore.summary}</p>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Score Breakdown</h3>
          
          {/* Keyword Match */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Keyword Match</span>
              <span className={getScoreColor(atsScore.scoreBreakdown.keywordMatch)}>
                {atsScore.scoreBreakdown.keywordMatch}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${
                  atsScore.scoreBreakdown.keywordMatch >= 80
                    ? 'bg-emerald-400'
                    : atsScore.scoreBreakdown.keywordMatch >= 60
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
                }`}
                style={{ width: `${atsScore.scoreBreakdown.keywordMatch}%` }}
              />
            </div>
          </div>

          {/* Skills Match */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Skills Match</span>
              <span className={getScoreColor(atsScore.scoreBreakdown.skillsMatch)}>
                {Math.round(atsScore.scoreBreakdown.skillsMatch)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${
                  atsScore.scoreBreakdown.skillsMatch >= 80
                    ? 'bg-emerald-400'
                    : atsScore.scoreBreakdown.skillsMatch >= 60
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
                }`}
                style={{ width: `${Math.min(atsScore.scoreBreakdown.skillsMatch, 100)}%` }}
              />
            </div>
          </div>

          {/* Experience Match */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Experience Match</span>
              <span className={getScoreColor(atsScore.scoreBreakdown.experienceMatch)}>
                {atsScore.scoreBreakdown.experienceMatch}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${
                  atsScore.scoreBreakdown.experienceMatch >= 80
                    ? 'bg-emerald-400'
                    : atsScore.scoreBreakdown.experienceMatch >= 60
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
                }`}
                style={{ width: `${atsScore.scoreBreakdown.experienceMatch}%` }}
              />
            </div>
          </div>

          {/* Format Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Format Score</span>
              <span className={getScoreColor(atsScore.scoreBreakdown.formatScore)}>
                {atsScore.scoreBreakdown.formatScore}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${
                  atsScore.scoreBreakdown.formatScore >= 80
                    ? 'bg-emerald-400'
                    : atsScore.scoreBreakdown.formatScore >= 60
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
                }`}
                style={{ width: `${atsScore.scoreBreakdown.formatScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Matching Skills */}
        {atsScore.job_matches[0]?.matching_skills && atsScore.job_matches[0].matching_skills.length > 0 && (
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
            <h3 className="text-sm font-semibold text-emerald-100 mb-3">
              ✓ Matching Skills ({atsScore.job_matches[0].matching_skills.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {atsScore.job_matches[0].matching_skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-medium text-emerald-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {atsScore.job_matches[0]?.missing_skills && atsScore.job_matches[0].missing_skills.length > 0 && (
          <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4">
            <h3 className="text-sm font-semibold text-red-100 mb-3">
              ✗ Missing Skills ({atsScore.job_matches[0].missing_skills.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {atsScore.job_matches[0].missing_skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-red-400/20 px-3 py-1 text-xs font-medium text-red-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {atsScore.recommendations.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Recommendations</h3>
            <ul className="space-y-2">
              {atsScore.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                  <svg className="h-4 w-4 shrink-0-cyan-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Career Path Suggestion */}
        {atsScore.career_path_suggestion && (
          <div className="rounded-xl border border-purple-400/30 bg-purple-400/10 p-4">
            <h3 className="text-sm font-semibold text-purple-100 mb-2">Career Path Suggestion</h3>
            <p className="text-sm text-purple-200/80">{atsScore.career_path_suggestion}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default ATSScoreCard;
