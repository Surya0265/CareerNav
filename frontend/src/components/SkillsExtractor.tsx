import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Upload, X, Check, FileText, ArrowRight, Plus } from 'lucide-react';
import { getUserSkills, addUserSkill, updateUserSkill, deleteUserSkill } from '../utils/skillsApi';

interface SkillsExtractorProps {
  onExtracted?: () => void;
}

interface ExtractedSkill {
  name: string;
  level?: string;
  type: string;
  selected: boolean;
}

export function SkillsExtractor({ onExtracted }: SkillsExtractorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<ExtractedSkill[]>([]);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Clear selected file
  const handleClearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Extract skills from resume
  const handleExtractSkills = async () => {
    if (!file) return;

    try {
      setIsExtracting(true);
      const result = await extractSkillsFromResume(file);
      
      // Convert results to our format with selected state
      const skills = result.skills.map((skill: any) => ({
        name: skill.name,
        level: skill.level || 'intermediate',
        type: skill.type || 'technical',
        selected: true
      }));
      
      setExtractedSkills(skills);
      setIsResultsOpen(true);
    } catch (error) {
      console.error('Extraction failed:', error);
      toast({
        title: 'Extraction Failed',
        description: error instanceof Error ? error.message : 'Could not extract skills from resume',
        variant: 'destructive',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // Toggle skill selection
  const toggleSkill = (index: number) => {
    setExtractedSkills(skills => 
      skills.map((skill, i) => 
        i === index ? { ...skill, selected: !skill.selected } : skill
      )
    );
  };

  // Save selected skills to profile
  const handleSaveSkills = async () => {
    try {
      setIsSaving(true);
      const selectedSkills = extractedSkills.filter(skill => skill.selected);
      
      if (selectedSkills.length === 0) {
        toast({
          title: 'No Skills Selected',
          description: 'Please select at least one skill to save.',
          variant: 'default',
        });
        return;
      }

      await saveExtractedSkills(selectedSkills);
      
      toast({
        title: 'Skills Saved',
        description: `${selectedSkills.length} skills have been added to your profile.`,
        variant: 'default',
      });
      
      // Clear state
      setFile(null);
      setExtractedSkills([]);
      setIsResultsOpen(false);
      
      // Call callback if provided
      if (onExtracted) {
        onExtracted();
      }
    } catch (error) {
      console.error('Saving skills failed:', error);
      toast({
        title: 'Failed to Save Skills',
        description: error instanceof Error ? error.message : 'Could not save skills to your profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-6 border shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Extract Skills from Resume</h2>
      <p className="text-muted-foreground mb-6">
        Upload your resume to automatically extract your skills. We support PDF and DOC/DOCX files.
      </p>
      
      <div className="space-y-6">
        {!file ? (
          <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/30">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-5 w-5" />
              Select Resume File
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">
              PDF, DOC, or DOCX files up to 10MB
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 mr-3 text-primary" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleClearFile}>
                <X className="h-4 w-4" />
              </Button>
              <Button disabled={isExtracting} onClick={handleExtractSkills}>
                {isExtracting ? (
                  <>Extracting...</>
                ) : (
                  <>
                    Extract Skills
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Extraction Results Dialog */}
      <AlertDialog open={isResultsOpen} onOpenChange={setIsResultsOpen}>
        <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Extracted Skills</AlertDialogTitle>
            <AlertDialogDescription>
              We found the following skills in your resume. Select the ones you want to add to your profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {extractedSkills.length > 0 ? (
            <div className="py-4 space-y-4">
              <div className="flex justify-between mb-2">
                <span>
                  {extractedSkills.filter(s => s.selected).length} of {extractedSkills.length} skills selected
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setExtractedSkills(skills => 
                    skills.map(skill => ({ ...skill, selected: true }))
                  )}
                >
                  Select All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {extractedSkills.map((skill, index) => (
                  <div 
                    key={`${skill.name}-${index}`}
                    className={`flex items-center justify-between p-3 border rounded-md ${
                      skill.selected ? 'border-primary bg-primary/5' : 'border-muted'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{skill.name}</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{skill.type}</Badge>
                        {skill.level && (
                          <Badge variant="secondary">{skill.level}</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant={skill.selected ? "default" : "outline"} 
                      size="sm"
                      onClick={() => toggleSkill(index)}
                    >
                      {skill.selected ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p>No skills were extracted from your resume.</p>
            </div>
          )}
          
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setIsResultsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSkills}
              disabled={extractedSkills.filter(s => s.selected).length === 0 || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Selected Skills'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}