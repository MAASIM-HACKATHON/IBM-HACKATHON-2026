import { type ReactElement, useState } from 'react';
import type { ATSDebugInfo } from '../../../utilities/system-utils/atsDebugger';
import { formatATSDebugInfo } from '../../../utilities/system-utils/atsDebugger';

interface ATSDebugPanelProps {
  debugInfo: ATSDebugInfo;
}

function ATSDebugPanel({ debugInfo }: ATSDebugPanelProps): ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);

  const copyDebugInfo = async () => {
    try {
      await navigator.clipboard.writeText(formatATSDebugInfo(debugInfo));
      alert('Debug info copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="rounded-[24px] border border-yellow-400/30 bg-yellow-400/10 p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/20">
            <svg className="h-5 w-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-yellow-100">ATS Debug Panel</h3>
            <p className="text-sm text-yellow-200/80">Diagnostic information for troubleshooting</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1.5 text-xs text-yellow-200 transition hover:bg-yellow-400/20"
            onClick={copyDebugInfo}
            type="button"
          >
            Copy
          </button>
          <button
            className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1.5 text-xs text-yellow-200 transition hover:bg-yellow-400/20"
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Issues Summary */}
      {debugInfo.issues.length > 0 && (
        <div className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 p-4">
          <h4 className="text-sm font-semibold text-red-100 mb-2">
            ⚠️ Issues Found ({debugInfo.issues.length})
          </h4>
          <ul className="space-y-1">
            {debugInfo.issues.map((issue, index) => (
              <li key={index} className="text-sm text-red-200">
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {debugInfo.suggestions.length > 0 && (
        <div className="mt-3 rounded-xl border border-blue-400/30 bg-blue-400/10 p-4">
          <h4 className="text-sm font-semibold text-blue-100 mb-2">
            💡 Suggestions ({debugInfo.suggestions.length})
          </h4>
          <ul className="space-y-1">
            {debugInfo.suggestions.slice(0, isExpanded ? undefined : 3).map((suggestion, index) => (
              <li key={index} className="text-sm text-blue-200">
                • {suggestion}
              </li>
            ))}
            {!isExpanded && debugInfo.suggestions.length > 3 && (
              <li className="text-xs text-blue-300 italic">
                +{debugInfo.suggestions.length - 3} more suggestions...
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Detailed Info (Expanded) */}
      {isExpanded && (
        <div className="mt-4 space-y-3">
          {/* Resume Data */}
          <details className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-white">
              📄 Resume Data
            </summary>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <div className="flex justify-between">
                <span>Has Data:</span>
                <span className={debugInfo.resumeData.hasData ? 'text-emerald-300' : 'text-red-300'}>
                  {debugInfo.resumeData.hasData ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Skills Count:</span>
                <span>{debugInfo.resumeData.skillsCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Experience Count:</span>
                <span>{debugInfo.resumeData.experienceCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Projects Count:</span>
                <span>{debugInfo.resumeData.projectsCount}</span>
              </div>
              {debugInfo.resumeData.skills.length > 0 && (
                <div className="mt-2">
                  <span className="font-medium">Skills:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {debugInfo.resumeData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>

          {/* Job Data */}
          <details className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-white">
              💼 Job Data
            </summary>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <div className="flex justify-between">
                <span>Has Job Description:</span>
                <span className={debugInfo.jobData.hasJobDescription ? 'text-emerald-300' : 'text-red-300'}>
                  {debugInfo.jobData.hasJobDescription ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Has Job Analysis:</span>
                <span className={debugInfo.jobData.hasJobAnalysis ? 'text-emerald-300' : 'text-red-300'}>
                  {debugInfo.jobData.hasJobAnalysis ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Required Skills Count:</span>
                <span>{debugInfo.jobData.requiredSkillsCount}</span>
              </div>
              {debugInfo.jobData.requiredSkills.length > 0 && (
                <div className="mt-2">
                  <span className="font-medium">Required Skills:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {debugInfo.jobData.requiredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>

          {/* ATS Response */}
          <details className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-white">
              📊 ATS Response
            </summary>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <div className="flex justify-between">
                <span>Has Response:</span>
                <span className={debugInfo.atsResponse.hasResponse ? 'text-emerald-300' : 'text-red-300'}>
                  {debugInfo.atsResponse.hasResponse ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Match Score:</span>
                <span className="font-bold text-white">{debugInfo.atsResponse.matchScore}%</span>
              </div>
              <div className="flex justify-between">
                <span>Detected Skills:</span>
                <span>{debugInfo.atsResponse.detectedSkillsCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Matching Skills:</span>
                <span>{debugInfo.atsResponse.matchingSkillsCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Missing Skills:</span>
                <span>{debugInfo.atsResponse.missingSkillsCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Experience Level:</span>
                <span>{debugInfo.atsResponse.experienceLevel}</span>
              </div>
              <div className="flex justify-between">
                <span>Confidence:</span>
                <span>{(debugInfo.atsResponse.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          </details>
        </div>
      )}

      <div className="mt-4 text-xs text-yellow-200/60">
        Debug timestamp: {new Date(debugInfo.timestamp).toLocaleString()}
      </div>
    </div>
  );
}

export default ATSDebugPanel;
