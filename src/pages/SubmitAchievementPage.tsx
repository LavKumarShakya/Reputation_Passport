import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { useSubmitAchievement } from '@/hooks/useSubmissions';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Award, Zap, FileText, GitBranch, BookOpen, Trophy,
  Upload, ChevronRight, ChevronLeft, Check, X, Loader2,
  AlertCircle, File, Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Submission types ──────────────────────────────────────────────────────────
const SUBMISSION_TYPES = [
  { id: 'certificate',  label: 'Certificate',        icon: Award,     color: 'from-blue-500/20 to-cyan-500/20',   border: 'border-blue-500/40',   text: 'text-blue-400',   description: 'Course completions, professional certs' },
  { id: 'hackathon',   label: 'Hackathon',           icon: Zap,       color: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/40', text: 'text-yellow-400', description: 'Hackathon participation or wins' },
  { id: 'research',    label: 'Research Paper',      icon: BookOpen,  color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/40', text: 'text-purple-400', description: 'Published papers, preprints, journals' },
  { id: 'opensource',  label: 'Open Source',         icon: GitBranch, color: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/40',  text: 'text-green-400',  description: 'Contributions to public repositories' },
  { id: 'workshop',    label: 'Workshop',            icon: FileText,  color: 'from-indigo-500/20 to-blue-500/20', border: 'border-indigo-500/40', text: 'text-indigo-400', description: 'Attended or conducted workshops' },
  { id: 'competition', label: 'Competition',         icon: Trophy,    color: 'from-red-500/20 to-rose-500/20',   border: 'border-red-500/40',    text: 'text-red-400',    description: 'Coding contests, olympiads, awards' },
];

// ── Dynamic fields per type ───────────────────────────────────────────────────
const FIELDS_BY_TYPE: Record<string, Array<{ name: string; label: string; placeholder: string; required?: boolean; type?: string; metaKey?: boolean }>> = {
  certificate: [
    { name: 'title',           label: 'Certificate Title', placeholder: 'e.g. Google Cloud Professional Developer', required: true },
    { name: 'issuer',          label: 'Issuer / Platform',  placeholder: 'e.g. Coursera, Google, AWS',              required: true },
    { name: 'certificateId',   label: 'Certificate ID',     placeholder: 'e.g. ABC-123-XYZ',                        metaKey: true },
    { name: 'verificationUrl', label: 'Verification URL',   placeholder: 'https://verify.coursera.org/...',         type: 'url' },
    { name: 'issueDate',       label: 'Issue Date',         placeholder: '',                                        type: 'date', metaKey: true },
  ],
  hackathon: [
    { name: 'title',           label: 'Hackathon Name',   placeholder: 'e.g. ETHIndia 2024',        required: true },
    { name: 'issuer',          label: 'Organizer',        placeholder: 'e.g. Devfolio, MLH',        required: true },
    { name: 'year',            label: 'Year',             placeholder: 'e.g. 2024',                 type: 'number', metaKey: true },
    { name: 'projectName',     label: 'Project Name',     placeholder: 'e.g. AuraChain',            metaKey: true },
    { name: 'githubRepoUrl',   label: 'GitHub Repository',placeholder: 'https://github.com/...',    type: 'url', metaKey: true },
    { name: 'verificationUrl', label: 'Project URL',      placeholder: 'https://devfolio.co/...',   type: 'url' },
    { name: 'winnerUrl',       label: 'Winner Page URL',  placeholder: 'https://...',               type: 'url', metaKey: true },
  ],
  research: [
    { name: 'title',           label: 'Paper Title',   placeholder: 'Full paper title',          required: true },
    { name: 'issuer',          label: 'Journal / Publisher', placeholder: 'e.g. IEEE, arXiv, Nature', required: true },
    { name: 'verificationUrl', label: 'DOI / Paper URL',   placeholder: 'https://doi.org/...',   type: 'url' },
    { name: 'publicationDate', label: 'Publication Date',  placeholder: '',                      type: 'date', metaKey: true },
  ],
  opensource: [
    { name: 'title',           label: 'Repository Name', placeholder: 'e.g. facebook/react',   required: true },
    { name: 'issuer',          label: 'Organization',     placeholder: 'e.g. Meta, Google',     required: true },
    { name: 'repoUrl',         label: 'GitHub Repo URL',  placeholder: 'https://github.com/...', type: 'url', metaKey: true },
    { name: 'verificationUrl', label: 'Contribution URL', placeholder: 'PR or commit link',     type: 'url' },
    { name: 'contributionType',label: 'Contribution Type', placeholder: 'e.g. Bug fix, Feature, Documentation', metaKey: true },
  ],
  workshop: [
    { name: 'title',           label: 'Workshop Title',  placeholder: 'e.g. Rust Systems Programming', required: true },
    { name: 'issuer',          label: 'Organizer',       placeholder: 'e.g. IEEE Student Branch',      required: true },
    { name: 'verificationUrl', label: 'Event URL',       placeholder: 'https://...',                   type: 'url' },
    { name: 'workshopDate',    label: 'Workshop Date',   placeholder: '',                              type: 'date', metaKey: true },
  ],
  competition: [
    { name: 'title',           label: 'Competition Name', placeholder: 'e.g. ICPC 2024 Regional',   required: true },
    { name: 'issuer',          label: 'Organizer',        placeholder: 'e.g. ICPC Foundation',       required: true },
    { name: 'rank',            label: 'Rank / Position',  placeholder: 'e.g. 1st, Top 10%',         metaKey: true },
    { name: 'verificationUrl', label: 'Scoreboard / Results URL', placeholder: 'https://...',        type: 'url' },
    { name: 'year',            label: 'Year',             placeholder: 'e.g. 2024',                  type: 'number', metaKey: true },
  ],
};

const STEPS = ['Select Type', 'Fill Details', 'Upload File', 'Review & Submit'];

export default function SubmitAchievementPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { mutateAsync: submitAchievement, isPending } = useSubmitAchievement();

  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [fileDragOver, setFileDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Field handlers ──────────────────────────────────────────────────────────
  const setField = useCallback((name: string, value: string) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  // ── Step validation ─────────────────────────────────────────────────────────
  const validateStep = useCallback(() => {
    if (step === 0) {
      if (!selectedType) { toast({ title: 'Please select a type', variant: 'destructive' }); return false; }
    }
    if (step === 1) {
      const fields = FIELDS_BY_TYPE[selectedType!] || [];
      const newErrors: Record<string, string> = {};
      fields.filter(f => f.required).forEach(f => {
        if (!formValues[f.name]?.trim()) newErrors[f.name] = `${f.label} is required`;
      });
      // URL validation
      fields.filter(f => f.type === 'url' && formValues[f.name]).forEach(f => {
        try { new URL(formValues[f.name]); } catch { newErrors[f.name] = 'Invalid URL format'; }
      });
      if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return false; }
    }
    return true;
  }, [step, selectedType, formValues, toast]);

  const nextStep = () => { if (validateStep()) setStep(s => Math.min(s + 1, 3)); };
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  // ── File handling ───────────────────────────────────────────────────────────
  const handleFileSelect = (f: File | null) => {
    if (!f) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(f.type)) {
      toast({ title: 'Invalid file type', description: 'Only PDF, JPG, PNG, or WebP are allowed', variant: 'destructive' });
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum file size is 10 MB', variant: 'destructive' });
      return;
    }
    setFile(f);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedType || !user) return;

    const fields = FIELDS_BY_TYPE[selectedType] || [];
    const formData = new FormData();
    formData.append('type', selectedType);

    // Separate top-level fields from metadata
    const metaObj: Record<string, string> = {};
    fields.forEach(f => {
      const val = formValues[f.name];
      if (!val) return;
      if (f.name === 'title' || f.name === 'issuer' || f.name === 'verificationUrl') {
        formData.append(f.name, val);
      } else if (f.metaKey) {
        metaObj[f.name] = val;
      }
    });
    formData.append('metadata', JSON.stringify(metaObj));
    if (file) formData.append('file', file);

    try {
      await submitAchievement(formData);
      toast({
        title: '✅ Submitted!',
        description: 'Your achievement is queued for verification. We\'ll notify you when it\'s done.',
      });
      navigate('/achievements');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Submission failed. Please try again.';
      toast({ title: 'Submission Error', description: msg, variant: 'destructive' });
    }
  };

  const selectedTypeData = SUBMISSION_TYPES.find(t => t.id === selectedType);
  const fields = selectedType ? FIELDS_BY_TYPE[selectedType] : [];

  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative">
        {/* Background */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,rgba(var(--primary-rgb,99,102,241),0.06),transparent_60%)]" />

        <div className="container mx-auto px-6 py-12 lg:py-16 relative z-10 max-w-4xl">

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-[2px] w-10 bg-primary" />
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">Achievement Registry</span>
            </div>
            <h1 className="font-heading text-5xl font-bold uppercase tracking-tight leading-[0.9] mb-2">
              Submit<br />
              <span className="text-muted-foreground/70">Achievement</span>
            </h1>
            <p className="text-muted-foreground font-mono text-sm mt-3">
              All submissions enter a verification queue. Only verified achievements update your reputation.
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-12">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-8 h-8 rounded-none border flex items-center justify-center font-mono text-xs font-bold transition-all duration-300',
                    i < step ? 'bg-primary border-primary text-primary-foreground' :
                    i === step ? 'border-primary text-primary bg-primary/10' :
                    'border-border/50 text-muted-foreground bg-secondary/10'
                  )}>
                    {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span className={cn(
                    'font-mono text-xs uppercase tracking-widest hidden sm:block',
                    i === step ? 'text-foreground' : 'text-muted-foreground'
                  )}>{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn('flex-1 h-px mx-3 transition-all duration-500', i < step ? 'bg-primary' : 'bg-border/40')} />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >

              {/* ── Step 0: Select Type ── */}
              {step === 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {SUBMISSION_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={cn(
                          'group relative p-6 border text-left transition-all duration-200 hover:scale-[1.02]',
                          `bg-gradient-to-br ${type.color}`,
                          isSelected ? `${type.border} ring-2 ring-offset-0` : 'border-border/40 hover:border-border',
                          isSelected ? type.border.replace('/40', '') : ''
                        )}
                      >
                        <div className={cn('mb-4 p-2.5 w-fit border', type.border)}>
                          <Icon className={cn('h-5 w-5', type.text)} />
                        </div>
                        <h3 className="font-heading text-base font-bold uppercase tracking-tight mb-1">{type.label}</h3>
                        <p className="font-mono text-[10px] text-muted-foreground uppercase leading-relaxed">{type.description}</p>
                        {isSelected && (
                          <div className={cn('absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center', type.text.replace('text-', 'bg-').replace('-400', '-500'))}>
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── Step 1: Fill Details ── */}
              {step === 1 && selectedType && (
                <div className="border border-border/50 bg-secondary/5 p-8">
                  <div className="flex items-center gap-3 mb-8">
                    {selectedTypeData && (
                      <>
                        <div className={cn('p-2 border', selectedTypeData.border)}>
                          <selectedTypeData.icon className={cn('h-4 w-4', selectedTypeData.text)} />
                        </div>
                        <div>
                          <span className={cn('font-mono text-[10px] font-bold uppercase tracking-widest', selectedTypeData.text)}>
                            {selectedTypeData.label}
                          </span>
                          <p className="font-mono text-xs text-muted-foreground">Fill in the verification details</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {fields.map((field) => (
                      <div key={field.name} className={field.name === 'title' ? 'md:col-span-2' : ''}>
                        <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
                          {field.label}
                          {field.required && <span className="text-red-400 ml-1">*</span>}
                        </Label>
                        <Input
                          type={field.type || 'text'}
                          value={formValues[field.name] || ''}
                          onChange={e => setField(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className={cn(
                            'rounded-none border-border/50 bg-background font-mono text-sm h-11 focus:border-primary',
                            errors[field.name] && 'border-red-500 focus:border-red-500'
                          )}
                        />
                        {errors[field.name] && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-red-400 font-mono text-[10px] uppercase">
                            <AlertCircle className="h-3 w-3" />
                            {errors[field.name]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Step 2: Upload File ── */}
              {step === 2 && (
                <div className="border border-border/50 bg-secondary/5 p-8">
                  <div className="mb-6">
                    <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-1">Upload File</h2>
                    <p className="font-mono text-xs text-muted-foreground uppercase">
                      PDF or image (JPG, PNG, WebP) · Max 10 MB · Optional but improves verification accuracy
                    </p>
                  </div>

                  {/* Drop zone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setFileDragOver(true); }}
                    onDragLeave={() => setFileDragOver(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setFileDragOver(false);
                      handleFileSelect(e.dataTransfer.files[0] || null);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'relative border-2 border-dashed cursor-pointer transition-all duration-200 p-12 flex flex-col items-center justify-center gap-4 min-h-[200px]',
                      fileDragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border/50 hover:border-border hover:bg-secondary/10',
                      file && 'border-green-500/50 bg-green-500/5'
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={e => handleFileSelect(e.target.files?.[0] || null)}
                    />

                    {file ? (
                      <>
                        <div className="p-4 border border-green-500/30 bg-green-500/10">
                          {file.type.startsWith('image/') ? (
                            <ImageIcon className="h-8 w-8 text-green-400" />
                          ) : (
                            <File className="h-8 w-8 text-green-400" />
                          )}
                        </div>
                        <div className="text-center">
                          <p className="font-mono text-sm font-bold text-green-400 uppercase">{file.name}</p>
                          <p className="font-mono text-xs text-muted-foreground mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type}
                          </p>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                          className="absolute top-3 right-3 p-1.5 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <X className="h-4 w-4 text-muted-foreground hover:text-red-400" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="p-4 border border-border/50">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                          <p className="font-mono text-sm font-bold uppercase text-foreground">
                            {fileDragOver ? 'Drop file here' : 'Drag & drop or click to upload'}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground mt-1 uppercase">
                            Certificate PDF or image
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <p className="mt-4 font-mono text-[10px] text-muted-foreground uppercase leading-relaxed">
                    ⚠ Files are stored temporarily until verification. Only verified certificates are uploaded to IPFS.
                    Unverified files are deleted automatically.
                  </p>
                </div>
              )}

              {/* ── Step 3: Review & Submit ── */}
              {step === 3 && selectedType && (
                <div className="border border-border/50 bg-secondary/5 p-8">
                  <h2 className="font-heading text-xl font-bold uppercase tracking-tight mb-6">Review Submission</h2>

                  <div className="space-y-4">
                    {/* Type */}
                    <div className="flex items-center justify-between py-3 border-b border-border/30">
                      <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Type</span>
                      <span className={cn('font-mono text-xs font-bold uppercase', selectedTypeData?.text)}>
                        {selectedTypeData?.label}
                      </span>
                    </div>

                    {/* All filled fields */}
                    {fields.map(f => formValues[f.name] && (
                      <div key={f.name} className="flex items-start justify-between py-3 border-b border-border/30 gap-4">
                        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground shrink-0">{f.label}</span>
                        <span className="font-mono text-xs text-foreground text-right break-all">{formValues[f.name]}</span>
                      </div>
                    ))}

                    {/* File */}
                    <div className="flex items-center justify-between py-3 border-b border-border/30">
                      <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">File</span>
                      {file ? (
                        <span className="font-mono text-xs text-green-400 font-bold">{file.name}</span>
                      ) : (
                        <span className="font-mono text-xs text-muted-foreground">No file attached</span>
                      )}
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="mt-8 p-4 border border-primary/20 bg-primary/5">
                    <p className="font-mono text-[10px] text-muted-foreground uppercase leading-relaxed">
                      ⏳ After submission, your achievement enters the verification queue. Workers will verify
                      it in the background. You'll receive a real-time notification when verification completes.
                      Only verified achievements contribute to your reputation score and Soulbound NFT.
                    </p>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={step === 0 ? () => navigate('/achievements') : prevStep}
              className="rounded-none font-bold uppercase tracking-widest h-12 px-8 border-border/50 hover:bg-secondary"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {step === 0 ? 'Cancel' : 'Back'}
            </Button>

            {step < 3 ? (
              <Button
                onClick={nextStep}
                className="rounded-none font-bold uppercase tracking-widest h-12 px-8"
                disabled={step === 0 && !selectedType}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isPending}
                className="rounded-none font-bold uppercase tracking-widest h-12 px-10 bg-primary hover:bg-primary/90"
              >
                {isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                ) : (
                  <>Submit for Verification<ChevronRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            )}
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
