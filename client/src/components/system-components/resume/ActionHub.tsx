import { type ReactElement, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Zap, BarChart3, Mail, AlertCircle, Loader2 } from 'lucide-react';

interface ActionHubProps {
  loading: boolean;
  hasGeneratedResume: boolean;
  hasATSScore: boolean;
  hasJobDescription: boolean;
  hasJobAnalysis: boolean;
  onGenerateATSResume: () => Promise<void>;
  onGenerateFullCV: () => Promise<void>;
  onRunATSAnalysis: () => Promise<void>;
  onGenerateEmail: () => void;
}

type ActionType = 'ats-resume' | 'full-cv' | 'ats-analysis' | 'email' | null;

function ActionHub({
  loading,
  hasGeneratedResume,
  hasATSScore,
  hasJobDescription,
  hasJobAnalysis,
  onGenerateATSResume,
  onGenerateFullCV,
  onRunATSAnalysis,
  onGenerateEmail,
}: ActionHubProps): ReactElement {
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [error, setError] = useState<string | null>(null);

  // Check prerequisites for each action
  const canGenerateResume = hasJobDescription;
  const canRunATSAnalysis = hasJobDescription && hasJobAnalysis;
  const canGenerateEmail = hasGeneratedResume;

  // Handle action with error handling
  const handleAction = async (
    action: ActionType,
    handler: () => Promise<void>,
    canExecute: boolean,
    prerequisiteMessage: string
  ) => {
    if (!canExecute) {
      setError(prerequisiteMessage);
      setTimeout(() => setError(null), 4000);
      return;
    }

    setActiveAction(action);
    setError(null);

    try {
      await handler();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setTimeout(() => setError(null), 5000);
    } finally {
      setActiveAction(null);
    }
  };

  const isActionLoading = (action: ActionType) => loading && activeAction === action;

  return (
    <section className="overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/70 shadow-lg backdrop-blur">
      <div className="border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
            <Zap className="h-5 w-5 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Action Hub</h2>
            <p className="text-sm text-slate-400">Generate and analyze</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Generate ATS Resume */}
        <div className="relative group">
          <Button
            onClick={() =>
              handleAction(
                'ats-resume',
                onGenerateATSResume,
                canGenerateResume,
                'Please add a job description before generating a resume'
              )
            }
            disabled={loading || !canGenerateResume}
            variant="primary"
            size="lg"
            className="w-full"
            title={!canGenerateResume ? 'Add a job description first' : ''}
          >
            {isActionLoading('ats-resume') ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating ATS Resume...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate ATS-Optimized Resume
              </>
            )}
          </Button>
          {!canGenerateResume && (
            <div className="absolute left-0 right-0 -bottom-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="mt-2 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300 shadow-lg">
                ⚠️ Add a job description first
              </div>
            </div>
          )}
        </div>

        {/* Generate Full CV */}
        <div className="relative group">
          <Button
            onClick={() =>
              handleAction(
                'full-cv',
                onGenerateFullCV,
                canGenerateResume,
                'Please add a job description before generating a CV'
              )
            }
            disabled={loading || !canGenerateResume}
            variant="outline"
            size="lg"
            className="w-full"
            title={!canGenerateResume ? 'Add a job description first' : ''}
          >
            {isActionLoading('full-cv') ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Full CV...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Full CV
              </>
            )}
          </Button>
          {!canGenerateResume && (
            <div className="absolute left-0 right-0 -bottom-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="mt-2 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300 shadow-lg">
                ⚠️ Add a job description first
              </div>
            </div>
          )}
        </div>

        {/* Run ATS Analysis */}
        <div className="relative group">
          <Button
            onClick={() =>
              handleAction(
                'ats-analysis',
                onRunATSAnalysis,
                canRunATSAnalysis,
                'Please analyze the job description first by clicking "Analyze Job Description"'
              )
            }
            disabled={loading || !canRunATSAnalysis}
            variant="secondary"
            size="lg"
            className="w-full"
            title={!canRunATSAnalysis ? 'Analyze job description first' : ''}
          >
            {isActionLoading('ats-analysis') ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running ATS Analysis...
              </>
            ) : (
              <>
                <BarChart3 className="mr-2 h-4 w-4" />
                {hasATSScore ? 'Re-run ATS Analysis' : 'Run ATS Analysis'}
              </>
            )}
          </Button>
          {!canRunATSAnalysis && (
            <div className="absolute left-0 right-0 -bottom-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="mt-2 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300 shadow-lg">
                ⚠️ Analyze job description first
              </div>
            </div>
          )}
        </div>

        {/* Generate Application Email */}
        {canGenerateEmail && (
          <div className="relative group">
            <Button
              onClick={() =>
                handleAction(
                  'email',
                  async () => {
                    onGenerateEmail();
                  },
                  canGenerateEmail,
                  'Generate a resume first before creating an application email'
                )
              }
              disabled={loading}
              variant="outline"
              size="lg"
              className="w-full"
            >
              {isActionLoading('email') ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opening Email Generator...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Generate Application Email
                </>
              )}
            </Button>
          </div>
        )}

        {/* Loading State Info */}
        {loading && activeAction && (
          <div className="rounded-xl border border-purple-400/30 bg-purple-400/10 px-4 py-3 text-sm text-purple-200">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>
                {activeAction === 'ats-resume' && 'Generating ATS-optimized resume with Watsonx AI...'}
                {activeAction === 'full-cv' && 'Generating comprehensive CV with Watsonx AI...'}
                {activeAction === 'ats-analysis' && 'Analyzing resume against job requirements...'}
                {activeAction === 'email' && 'Preparing email generator...'}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ActionHub;
