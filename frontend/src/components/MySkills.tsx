import { useEffect, useMemo, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Award, Trash2, Pencil, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { getUserSkills, addUserSkill, updateUserSkill, deleteUserSkill } from '../utils/skillsApi';

type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface Skill {
  _id?: string;
  name: string;
  level: SkillLevel;
  verified: boolean;
  type: 'technical' | 'soft';
  category?: string;
}

interface User {
  name: string;
  email: string;
  avatar: string;
  resumeUploaded: boolean;
  lastActivity: string;
}

interface MySkillsProps {
  user: User | null;
  onNavigate: (view: string) => void;
  onLogout?: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

const levelOptions: { value: SkillLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' }
];

const normalizeLevel = (level?: string | null): SkillLevel => {
  const normalized = (level || '').toLowerCase();
  if (['beginner', 'intermediate', 'advanced', 'expert'].includes(normalized)) {
    return normalized as SkillLevel;
  }
  return 'intermediate';
};

const normalizeSkill = (skill: any, type: 'technical' | 'soft'): Skill | null => {
  if (!skill || !skill.name) return null;
  return {
    _id: skill._id ? String(skill._id) : skill.id ? String(skill.id) : undefined,
    name: skill.name,
    level: normalizeLevel(skill.level),
    verified: Boolean(skill.verified),
    type,
    category: skill.category || undefined
  };
};

export function MySkills({ user, onNavigate, onBack, canGoBack = false }: MySkillsProps) {
  void user;
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSkill, setCurrentSkill] = useState<Skill | null>(null);
  const [newSkill, setNewSkill] = useState<{ name: string; level: SkillLevel; type: 'technical' | 'soft' }>(
    { name: '', level: 'intermediate', type: 'technical' }
  );

  const showBackButton = Boolean(onBack && canGoBack);

  useEffect(() => {
    void loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setIsFetching(true);
      setErrorMessage(null);
      const response = await getUserSkills();
      let normalized: Skill[] = [];

      if (Array.isArray(response)) {
        normalized = response
          .map((skill: any) => normalizeSkill(skill, skill?.type === 'soft' ? 'soft' : 'technical'))
          .filter((skill): skill is Skill => Boolean(skill));
      } else if (response && typeof response === 'object') {
        const technical = Array.isArray(response.technical)
          ? response.technical.map((skill: any) => normalizeSkill(skill, 'technical'))
          : [];
        const soft = Array.isArray(response.soft)
          ? response.soft.map((skill: any) => normalizeSkill(skill, 'soft'))
          : [];
        normalized = [...technical, ...soft].filter((skill): skill is Skill => Boolean(skill));
      }

      normalized.sort((a, b) => a.name.localeCompare(b.name));
      setSkills(normalized);
    } catch (error: any) {
      console.error('Error fetching skills:', error);
      setSkills([]);
      setErrorMessage(error?.message || 'Failed to load your skills. Please try again.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleBack = () => {
    if (showBackButton) {
      onBack?.();
    } else {
      onNavigate('dashboard');
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) return;
    try {
      setIsMutating(true);
      setErrorMessage(null);
      await addUserSkill(newSkill.name.trim(), newSkill.level, newSkill.type);
      toast.success('Skill added to your profile');
      setIsAddDialogOpen(false);
      setNewSkill({ name: '', level: 'intermediate', type: 'technical' });
      await loadSkills();
    } catch (error: any) {
      console.error('Error adding skill:', error);
      toast.error(error?.message || 'Unable to add skill');
      setErrorMessage(error?.message || 'Unable to add skill');
    } finally {
      setIsMutating(false);
    }
  };

  const handleEditSkill = async () => {
    if (!currentSkill) return;
    if (!currentSkill._id) {
      toast.error('Unable to update this skill because its identifier is missing.');
      return;
    }

    try {
      setIsMutating(true);
      setErrorMessage(null);
      await updateUserSkill(
        currentSkill._id,
        currentSkill.name.trim(),
        currentSkill.level,
        currentSkill.type
      );
      toast.success('Skill updated');
      setIsEditDialogOpen(false);
      setCurrentSkill(null);
      await loadSkills();
    } catch (error: any) {
      console.error('Error updating skill:', error);
      toast.error(error?.message || 'Unable to update skill');
      setErrorMessage(error?.message || 'Unable to update skill');
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteSkill = async (skill: Skill) => {
    if (!skill._id) {
      toast.error('Unable to delete this skill because its identifier is missing.');
      return;
    }

    try {
      setIsMutating(true);
      setErrorMessage(null);
      await deleteUserSkill(skill._id, skill.type);
      toast.success('Skill removed');
      await loadSkills();
    } catch (error: any) {
      console.error('Error deleting skill:', error);
      toast.error(error?.message || 'Unable to delete skill');
      setErrorMessage(error?.message || 'Unable to delete skill');
    } finally {
      setIsMutating(false);
    }
  };

  const openEditDialog = (skill: Skill) => {
    setCurrentSkill(skill);
    setIsEditDialogOpen(true);
  };

  const resetEditDialog = () => {
    setIsEditDialogOpen(false);
    setCurrentSkill(null);
  };

  const getLevelStyles = (level: SkillLevel) => {
    switch (level) {
      case 'beginner':
        return 'bg-slate-200 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200';
      case 'intermediate':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200';
      case 'advanced':
        return 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200';
      case 'expert':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };

  const technicalCount = useMemo(
    () => skills.filter(skill => skill.type === 'technical').length,
    [skills]
  );
  const softCount = useMemo(
    () => skills.filter(skill => skill.type === 'soft').length,
    [skills]
  );

  return (
    <div className="min-h-[calc(100vh-140px)] bg-muted/40 py-8 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <Card className="rounded-[32px] border border-border/60 bg-background/95 shadow-2xl shadow-primary/10">
          <CardContent className="space-y-8 p-6 sm:p-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={handleBack}
                    className="rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                  </Button>
                  <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary">
                    Skill Library
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">My Skills</h1>
                  <p className="text-sm text-muted-foreground">
                    Review, add, and refine the skills that power your AI recommendations.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => void loadSkills()}
                  className="rounded-2xl px-5"
                  disabled={isFetching}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="rounded-2xl px-6"
                  disabled={isMutating}
                >
                  {isMutating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Add Skill
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="rounded-2xl border border-border/60 bg-background/80 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Skills</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold text-foreground">{skills.length}</CardContent>
              </Card>
              <Card className="rounded-2xl border border-border/60 bg-background/80 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Technical</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold text-foreground">{technicalCount}</CardContent>
              </Card>
              <Card className="rounded-2xl border border-border/60 bg-background/80 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Soft Skills</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold text-foreground">{softCount}</CardContent>
              </Card>
              <Card className="rounded-2xl border border-primary/30 bg-primary/5 shadow-sm">
                <CardHeader className="pb-1">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Award className="h-4 w-4" /> Verified
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold text-primary">
                  {skills.filter(skill => skill.verified).length}
                </CardContent>
              </Card>
            </div>

            {errorMessage && (
              <Card className="rounded-2xl border-destructive/40 bg-destructive/5">
                <CardContent className="flex items-center gap-3 py-4 text-sm text-destructive">
                  <span>{errorMessage}</span>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {isFetching && skills.length === 0 && (
                <>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={`skill-skeleton-${index}`}
                      className="h-40 rounded-2xl border border-border/40 bg-muted/40 animate-pulse"
                    />
                  ))}
                </>
              )}

              {!isFetching && skills.length === 0 && (
                <Card className="col-span-full rounded-2xl border border-dashed border-muted-foreground/40 bg-muted/20">
                  <CardContent className="flex flex-col items-center gap-3 py-10 text-center text-muted-foreground">
                    <Award className="h-10 w-10 text-muted-foreground/60" />
                    <div>
                      <p className="text-sm font-medium text-foreground">No skills yet</p>
                      <p className="text-sm">Upload a resume or add skills manually to get started.</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {skills.map(skill => (
                <Card
                  key={skill._id || skill.name}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-border/60 bg-card/90 p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-foreground">{skill.name}</span>
                      {skill.verified && <Award className="h-4 w-4 text-emerald-500" />}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge className={`${getLevelStyles(skill.level)} px-3 py-1 text-[11px] uppercase tracking-wide`}>
                        {skill.level}
                      </Badge>
                      <Badge variant="outline" className="rounded-full border-border/60 px-3 py-1">
                        {skill.type === 'technical' ? 'Technical' : 'Soft skill'}
                      </Badge>
                      {skill.category && (
                        <Badge variant="secondary" className="rounded-full bg-muted px-3 py-1">
                          {skill.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl"
                      onClick={() => openEditDialog(skill)}
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteSkill(skill)}
                      disabled={isMutating}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add a new skill</DialogTitle>
            <DialogDescription>
              Skills added here will improve your AI recommendations and career insights.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="skill-type" className="text-right text-sm text-muted-foreground">
                Type
              </label>
              <Select
                value={newSkill.type}
                onValueChange={(value: 'technical' | 'soft') => setNewSkill({ ...newSkill, type: value })}
              >
                <SelectTrigger id="skill-type" className="col-span-3 rounded-xl">
                  <SelectValue placeholder="Select skill type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="soft">Soft skill</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="skill-name" className="text-right text-sm text-muted-foreground">
                Name
              </label>
              <Input
                id="skill-name"
                value={newSkill.name}
                onChange={(event) => setNewSkill({ ...newSkill, name: event.target.value })}
                placeholder="e.g. React, Team leadership"
                className="col-span-3 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="skill-level" className="text-right text-sm text-muted-foreground">
                Proficiency
              </label>
              <Select
                value={newSkill.level}
                onValueChange={(value: SkillLevel) => setNewSkill({ ...newSkill, level: value })}
              >
                <SelectTrigger id="skill-level" className="col-span-3 rounded-xl">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {levelOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleAddSkill}
              disabled={!newSkill.name.trim() || isMutating}
              className="rounded-xl"
            >
              {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isMutating ? 'Saving...' : 'Add skill'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open: boolean) => (open ? setIsEditDialogOpen(true) : resetEditDialog())}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit skill</DialogTitle>
            <DialogDescription>Adjust the skill details to keep your profile accurate.</DialogDescription>
          </DialogHeader>
          {currentSkill && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-skill-type" className="text-right text-sm text-muted-foreground">
                  Type
                </label>
                <Select
                  value={currentSkill.type}
                  onValueChange={(value: 'technical' | 'soft') =>
                    setCurrentSkill({ ...currentSkill, type: value })
                  }
                >
                  <SelectTrigger id="edit-skill-type" className="col-span-3 rounded-xl">
                    <SelectValue placeholder="Select skill type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="soft">Soft skill</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-skill-name" className="text-right text-sm text-muted-foreground">
                  Name
                </label>
                <Input
                  id="edit-skill-name"
                  value={currentSkill.name}
                  onChange={(event) => setCurrentSkill({ ...currentSkill, name: event.target.value })}
                  className="col-span-3 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-skill-level" className="text-right text-sm text-muted-foreground">
                  Proficiency
                </label>
                <Select
                  value={currentSkill.level}
                  onValueChange={(value: SkillLevel) =>
                    setCurrentSkill({ ...currentSkill, level: value })
                  }
                >
                  <SelectTrigger id="edit-skill-level" className="col-span-3 rounded-xl">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {levelOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={resetEditDialog} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleEditSkill}
              disabled={!currentSkill?.name.trim() || isMutating}
              className="rounded-xl"
            >
              {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isMutating ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
