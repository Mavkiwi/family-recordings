import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Upload, CheckCircle2, Heart, Mic, FileAudio, Clock, HelpCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  status: 'uploading' | 'complete' | 'error';
  progress: number;
}

export default function Index() {
  const [yourName, setYourName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (!yourName.trim()) {
      toast.error('Please enter your name first');
      return;
    }

    for (const file of Array.from(files)) {
      const fileId = crypto.randomUUID();
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
        status: 'uploading',
        progress: 0,
      };

      setUploadedFiles(prev => [...prev, newFile]);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === fileId
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          )
        );
      }, 200);

      try {
        // Create form data for webhook
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', yourName);
        formData.append('relationship', relationship);
        formData.append('timestamp', new Date().toISOString());

        // Send to n8n webhook
        const response = await fetch('https://plex.app.n8n.cloud/webhook/for-kirsten', {
          method: 'POST',
          mode: 'cors',
          body: formData,
        });

        clearInterval(interval);

        if (response.ok) {
          setUploadedFiles(prev =>
            prev.map(f =>
              f.id === fileId
                ? { ...f, status: 'complete', progress: 100 }
                : f
            )
          );
          toast.success(`${file.name} uploaded successfully!`);
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        clearInterval(interval);
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === fileId
              ? { ...f, status: 'error', progress: 0 }
              : f
          )
        );
        toast.error(`Failed to upload ${file.name}. Try emailing to jeff@plex.nz instead.`);
      }
    }
  }, [yourName, relationship]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const completedCount = uploadedFiles.filter(f => f.status === 'complete').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <Heart className="w-12 h-12 mx-auto mb-4 text-rose-400" />
          <h1 className="text-3xl font-semibold text-white mb-2">For Kirsten</h1>
          <p className="text-slate-300 text-lg">Share Your Memories</p>
        </div>

        {/* What & Why Section */}
        <Card className="mb-6 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" />
              What We're Doing
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-4">
            <p>
              We're gathering stories and memories to create a beautiful service that truly
              celebrates Mum's life. Your voice recordings will help us capture the real her —
              the stories, the phrases, the moments that made her who she was.
            </p>
            <div className="flex items-center gap-2 p-3 bg-rose-900/30 rounded-lg border border-rose-700">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <p className="text-rose-300 font-medium">
                Deadline: Wednesday 15th January
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How To Section */}
        <Accordion type="single" collapsible className="mb-6">
          <AccordionItem value="how-to" className="border-slate-700 bg-slate-800/30 rounded-lg px-4">
            <AccordionTrigger className="text-white hover:text-rose-300">
              <span className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                How to Record (tap to expand)
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-slate-300">
              <div className="space-y-4 pt-2 pb-4">
                <div className="flex items-start gap-3">
                  <Mic className="w-5 h-5 text-rose-400 mt-1 shrink-0" />
                  <div>
                    <p className="font-medium text-white">On your phone:</p>
                    <p>iPhone: Voice Memos app (built-in)</p>
                    <p>Android: Recorder or Voice Recorder app</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-rose-400 mt-1 shrink-0" />
                  <div>
                    <p className="font-medium text-white">Tips:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Find a quiet spot</li>
                      <li>Just chat like you're talking to a friend</li>
                      <li>Ramble is good — follow the tangents</li>
                      <li>10-20 minutes is great, longer is fine</li>
                      <li>Don't worry about getting emotional</li>
                    </ul>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Your Details */}
        <Card className="mb-6 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Your Details</CardTitle>
            <CardDescription className="text-slate-400">
              So we know who the recording is from
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-slate-200">Your Name *</Label>
              <Input
                id="name"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                placeholder="e.g. Sarah"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div>
              <Label htmlFor="relationship" className="text-slate-200">Relationship</Label>
              <Input
                id="relationship"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="e.g. Granddaughter, Friend, Neighbour"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Upload Area */}
        <Card className="mb-6 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileAudio className="w-5 h-5 text-rose-400" />
              Upload Your Recording
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging
                  ? 'border-rose-400 bg-rose-400/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-300 mb-4">
                Drag and drop your audio file here, or
              </p>
              <label>
                <input
                  type="file"
                  accept="audio/*,.m4a,.mp3,.wav,.ogg,.webm"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                <Button
                  variant="secondary"
                  className="cursor-pointer"
                  disabled={!yourName.trim()}
                  asChild
                >
                  <span>Choose Files</span>
                </Button>
              </label>
              {!yourName.trim() && (
                <p className="text-amber-400 text-sm mt-3">
                  Please enter your name above first
                </p>
              )}
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="text-white font-medium">
                  Uploaded Files ({completedCount} complete)
                </h3>
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg"
                  >
                    {file.status === 'complete' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                    ) : file.status === 'error' ? (
                      <div className="w-5 h-5 rounded-full bg-red-400 shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-rose-400 border-t-transparent animate-spin shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white truncate">{file.name}</p>
                      <p className="text-slate-400 text-sm">{formatFileSize(file.size)}</p>
                    </div>
                    {file.status === 'uploading' && (
                      <div className="w-20">
                        <Progress value={file.progress} className="h-2" />
                      </div>
                    )}
                    {file.status === 'complete' && (
                      <span className="text-green-400 text-sm">Done!</span>
                    )}
                    {file.status === 'error' && (
                      <span className="text-red-400 text-sm">Failed</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Success Message */}
        {completedCount > 0 && (
          <Card className="mb-6 bg-green-900/30 border-green-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-green-300 font-medium">Thank you!</p>
                  <p className="text-green-400/80 text-sm">
                    Your {completedCount === 1 ? 'recording has' : 'recordings have'} been received.
                    Jeff will be in touch if he has any questions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alternative Contact */}
        <Card className="bg-slate-800/30 border-slate-700">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-center text-sm">
              Having trouble uploading? Email your recording to{' '}
              <a href="mailto:jeff@plex.nz" className="text-rose-400 hover:underline">
                jeff@plex.nz
              </a>
              {' '}or text Jeff
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-500 text-sm">
          <p>Made with love for Kirsten</p>
        </div>

      </div>
    </div>
  );
}
