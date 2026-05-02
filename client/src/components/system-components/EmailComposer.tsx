import { useState, useEffect } from 'react';
import { FiMoon, FiCopy, FiCheck, FiZap, FiMinimize2, FiMaximize2, FiEdit3 } from 'react-icons/fi';
import { useEmailGenerator } from '../../hooks/useEmailGenerator';
import { EmailTone } from '../../services/emailService';

function EmailComposer() {
  const { generateEmail, loading, error, result } = useEmailGenerator();

  const [originalText, setOriginalText] = useState('');
  const [tone, setTone] = useState<EmailTone>('formal');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [copied, setCopied] = useState(false);
  const [wordCount, setWordCount] = useState({ original: 0, generated: 0 });

  // Update word count
  useEffect(() => {
    const count = originalText.trim() ? originalText.trim().split(/\s+/).length : 0;
    setWordCount(prev => ({ ...prev, original: count }));
  }, [originalText]);

  useEffect(() => {
    const count = generatedEmail.trim() ? generatedEmail.trim().split(/\s+/).length : 0;
    setWordCount(prev => ({ ...prev, generated: count }));
  }, [generatedEmail]);

  // Update result when generation completes
  useEffect(() => {
    if (result?.success && result.data) {
      setGeneratedEmail(result.data.generatedEmail);
      if (result.data.subject) {
        setSubject(result.data.subject);
      }
    }
  }, [result]);

  const handleGenerate = async () => {
    if (!originalText.trim()) return;
    await generateEmail(originalText, tone, 'generate');
  };

  const handleShorten = async () => {
    if (!generatedEmail.trim()) return;
    const response = await generateEmail(generatedEmail, tone, 'shorten');
    if (response.success && response.data) {
      setGeneratedEmail(response.data.generatedEmail);
    }
  };

  const handleExpand = async () => {
    if (!generatedEmail.trim()) return;
    const response = await generateEmail(generatedEmail, tone, 'expand');
    if (response.success && response.data) {
      setGeneratedEmail(response.data.generatedEmail);
    }
  };

  const handleFixGrammar = async () => {
    if (!generatedEmail.trim()) return;
    const response = await generateEmail(generatedEmail, tone, 'fix_grammar');
    if (response.success && response.data) {
      setGeneratedEmail(response.data.generatedEmail);
    }
  };

  const handleGenerateSubject = async () => {
    if (!generatedEmail.trim()) return;
    const response = await generateEmail(generatedEmail, tone, 'generate_subject');
    if (response.success && response.data?.subject) {
      setSubject(response.data.subject);
    }
  };

  const handleCopy = async () => {
    const fullEmail = subject ? `Subject: ${subject}\n\n${generatedEmail}` : generatedEmail;
    await navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setOriginalText('');
    setGeneratedEmail('');
    setSubject('');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-linear-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                <FiZap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Smart Email Composer
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Transform rough messages into professional emails
                </p>
              </div>
            </div>
            <button
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Theme indicator"
              disabled
            >
              <FiMoon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Message
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {wordCount.original} words
                </span>
              </div>
              <textarea
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="Paste your rough message here... e.g., 'need meeting tomorrow about project'"
                className="w-full h-64 p-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Tone Selector */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Select Tone
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {(['formal', 'friendly', 'urgent', 'casual'] as EmailTone[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      tone === t
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!originalText.trim() || loading}
              className="w-full bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FiZap className="w-5 h-5" />
                  <span>Generate Professional Email</span>
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Generated Email
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {wordCount.generated} words
                  </span>
                  {generatedEmail && (
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <FiCheck className="w-4 h-4 text-green-500" />
                      ) : (
                        <FiCopy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Subject Line */}
              {subject && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  />
                </div>
              )}

              <textarea
                value={generatedEmail}
                onChange={(e) => setGeneratedEmail(e.target.value)}
                placeholder="Your professional email will appear here..."
                className="w-full h-64 p-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Action Buttons */}
            {generatedEmail && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleShorten}
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-gray-700 dark:text-gray-300 font-medium disabled:opacity-50"
                >
                  <FiMinimize2 className="w-4 h-4" />
                  <span>Shorten</span>
                </button>

                <button
                  onClick={handleExpand}
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-gray-700 dark:text-gray-300 font-medium disabled:opacity-50"
                >
                  <FiMaximize2 className="w-4 h-4" />
                  <span>Expand</span>
                </button>

                <button
                  onClick={handleFixGrammar}
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-gray-700 dark:text-gray-300 font-medium disabled:opacity-50"
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span>Fix Grammar</span>
                </button>

                <button
                  onClick={handleGenerateSubject}
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-gray-700 dark:text-gray-300 font-medium disabled:opacity-50"
                >
                  <FiZap className="w-4 h-4" />
                  <span>Generate Subject</span>
                </button>
              </div>
            )}

            {generatedEmail && (
              <button
                onClick={handleClear}
                className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6">
            <div className="text-blue-600 dark:text-blue-400 text-2xl mb-2">✨</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Tone Selector
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose from formal, friendly, urgent, or casual tones
            </p>
          </div>

          <div className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6">
            <div className="text-purple-600 dark:text-purple-400 text-2xl mb-2">📧</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Subject Generator
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automatically create compelling subject lines
            </p>
          </div>

          <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6">
            <div className="text-green-600 dark:text-green-400 text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Smart Editing
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Shorten, expand, or fix grammar instantly
            </p>
          </div>

          <div className="bg-linear-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6">
            <div className="text-orange-600 dark:text-orange-400 text-2xl mb-2">🎨</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Dark Mode
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Beautiful light and dark themes
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EmailComposer;
