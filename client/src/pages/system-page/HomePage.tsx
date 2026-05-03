import { type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, FileText, Sparkles, Zap, Shield, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function HomePage(): ReactElement {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="w-full space-y-16">
      {/* Hero Section - Sub-task 7.1 */}
      <section className="text-center space-y-6">
        <Badge 
          variant="outline" 
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-[#2C4C82]/20 bg-[#2C4C82]/5 text-[#2C4C82] dark:border-[#2C4C82]/30 dark:bg-[#2C4C82]/10 dark:text-[#2C4C82]/90"
        >
          <Sparkles className="h-4 w-4" />
          Powered by IBM Watsonx AI
        </Badge>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            AI-Powered Professional Tools
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline your career with intelligent email composition and resume building powered by IBM Watsonx AI
          </p>
        </div>
      </section>

      {/* Feature Highlight Cards - Sub-task 7.2 */}
      <section className="grid md:grid-cols-2 gap-6">
        {/* Email Generator Card */}
        <Card 
          className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-border"
          onClick={() => handleNavigation('/email-generator')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleNavigation('/email-generator');
            }
          }}
        >
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-lg bg-[#2C4C82]/10 text-[#2C4C82] dark:bg-[#2C4C82]/20">
                <Mail className="h-6 w-6" />
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-sm text-muted-foreground">Click to start →</span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">Email Generator</h2>
              <p className="text-muted-foreground">
                Create professional emails with AI assistance. Perfect for job applications, networking, and business communications.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
              <Badge variant="secondary" className="text-xs">Auto-Fill</Badge>
              <Badge variant="secondary" className="text-xs">Multi-Language</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Resume Builder Card */}
        <Card 
          className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-border"
          onClick={() => handleNavigation('/resume-builder')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleNavigation('/resume-builder');
            }
          }}
        >
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-lg bg-[#2C4C82]/10 text-[#2C4C82] dark:bg-[#2C4C82]/20">
                <FileText className="h-6 w-6" />
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-sm text-muted-foreground">Click to start →</span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">Resume Builder</h2>
              <p className="text-muted-foreground">
                Build ATS-optimized resumes with AI. Get instant feedback and maximize your chances of landing interviews.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">ATS Optimization</Badge>
              <Badge variant="secondary" className="text-xs">AI Analysis</Badge>
              <Badge variant="secondary" className="text-xs">Live Preview</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Workflow Explanation Section - Sub-task 7.3 */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
          <p className="text-muted-foreground">Simple steps to enhance your professional content</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <Card className="border-border">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2C4C82] text-white text-sm font-semibold">
                  1
                </div>
                <h3 className="text-lg font-semibold text-foreground">Choose Your Tool</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Select Email Generator or Resume Builder based on your needs
              </p>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="border-border">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2C4C82] text-white text-sm font-semibold">
                  2
                </div>
                <h3 className="text-lg font-semibold text-foreground">Provide Context</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter your information or upload existing documents for AI analysis
              </p>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="border-border">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2C4C82] text-white text-sm font-semibold">
                  3
                </div>
                <h3 className="text-lg font-semibold text-foreground">Generate & Refine</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Let AI create professional content, then refine to perfection
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call-to-Action Section - Sub-task 7.4 */}
      <section className="space-y-6">
        <Card className="border-[#2C4C82]/20 bg-gradient-to-br from-[#2C4C82]/5 to-transparent">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Ready to Get Started?</h2>
              <p className="text-muted-foreground">Choose a tool and experience the power of AI-assisted content creation</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg"
                variant="primary"
                onClick={() => handleNavigation('/email-generator')}
                className="w-full sm:w-auto"
              >
                <Mail className="mr-2 h-5 w-5" />
                Start Email Generator
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => handleNavigation('/resume-builder')}
                className="w-full sm:w-auto"
              >
                <FileText className="mr-2 h-5 w-5" />
                Start Resume Builder
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Platform Features */}
      <section className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#2C4C82]/10 text-[#2C4C82]">
            <Zap className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">Fast Generation</h3>
            <p className="text-sm text-muted-foreground">Create content in seconds with AI</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#2C4C82]/10 text-[#2C4C82]">
            <Shield className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">Enterprise-Grade AI</h3>
            <p className="text-sm text-muted-foreground">Powered by IBM Watsonx</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#2C4C82]/10 text-[#2C4C82]">
            <Settings className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">Customizable</h3>
            <p className="text-sm text-muted-foreground">Tailor output to your needs</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
