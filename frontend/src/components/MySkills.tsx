import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
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
import { Plus, Award, Trash2, Pencil } from 'lucide-react';
import { getUserSkills, addUserSkill, updateUserSkill, deleteUserSkill } from '../utils/skillsApi';

interface Skill {
  _id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verified: boolean;
  type?: 'technical' | 'soft';
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
  onLogout: () => void;
}

export function MySkills({ user, onNavigate, onLogout }: MySkillsProps) {
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSkill, setCurrentSkill] = useState<Skill | null>(null);

  // New skill form state
  const [newSkill, setNewSkill] = useState({
    name: '',
    level: 'intermediate',
    type: 'technical',
  });

  // Load user skills on component mount
  useEffect(() => {
    fetchUserSkills();
  }, []);

  const fetchUserSkills = async () => {
    try {
      setIsLoading(true);
      const skills = await getUserSkills();
      let combined: Skill[] = [];
      if (Array.isArray(skills)) {
        combined = skills.filter(s => s && s.name);
      } else if (skills && (skills.technical || skills.soft)) {
        combined = [
          ...(skills.technical || []),
          ...(skills.soft || [])
        ].filter(s => s && s.name);
      }
      setAllSkills(combined);
    } catch (error) {
      console.error('Error fetching skills:', error);
      setAllSkills([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) return;
    try {
      setIsLoading(true);
      await addUserSkill(newSkill.name, newSkill.level, newSkill.type);
      setIsAddDialogOpen(false);
      setNewSkill({ name: '', level: 'intermediate', type: 'technical' });
      fetchUserSkills();
    } catch (error) {
      console.error('Error adding skill:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSkill = async () => {
    if (!currentSkill) return;
    try {
      setIsLoading(true);
      await updateUserSkill(currentSkill._id, currentSkill.name, currentSkill.level, currentSkill.type);
      setIsEditDialogOpen(false);
      fetchUserSkills();
    } catch (error) {
      console.error('Error updating skill:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSkill = async (id: string, type: 'technical' | 'soft') => {
    try {
      setIsLoading(true);
      await deleteUserSkill(id, type);
      fetchUserSkills();
    } catch (error) {
      console.error('Error deleting skill:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (skill: Skill) => {
    setCurrentSkill(skill);
    setIsEditDialogOpen(true);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-gray-200 text-gray-800';
      case 'intermediate':
        return 'bg-blue-200 text-blue-800';
      case 'advanced':
        return 'bg-purple-200 text-purple-800';
      case 'expert':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container py-6 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Skills</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Skill
          </Button>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allSkills.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground">
              No skills found. Upload a resume or add skills to get started.
            </div>
          )}
          {allSkills.map((skill) => (
            <Card
              key={skill._id || skill.name}
              className="p-4 flex flex-col gap-2 bg-card shadow-md border border-border"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg text-foreground">{skill.name}</span>
                {skill.verified && <Award className="w-4 h-4 text-success" />}
              </div>
              <Badge className={getLevelColor(skill.level)}>{skill.level}</Badge>
              {skill.category && (
                <span className="text-xs text-muted-foreground">{skill.category}</span>
              )}
              <div className="flex gap-2 mt-2">
                <Button size="icon" variant="ghost" onClick={() => openEditDialog(skill)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    handleDeleteSkill(skill._id || '', skill.type === 'soft' ? 'soft' : 'technical')
                  }
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Skill Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Skill</DialogTitle>
            <DialogDescription>
              Add a new skill to your profile. Skills can be verified when they are extracted from your resume.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Skill Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="skill-type" className="text-right">Type</label>
              <Select
                value={newSkill.type}
                onValueChange={(value) => setNewSkill({ ...newSkill, type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select skill type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Skill</SelectItem>
                  <SelectItem value="soft">Soft Skill</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Skill Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="skill-name" className="text-right">Name</label>
              <Input
                id="skill-name"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                placeholder="e.g., JavaScript, Communication, etc."
                className="col-span-3"
              />
            </div>

            {/* Skill Level */}
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="skill-level" className="text-right">Proficiency</label>
              <Select
                value={newSkill.level}
                onValueChange={(value) => setNewSkill({ ...newSkill, level: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSkill} disabled={!newSkill.name.trim() || isLoading}>
              {isLoading ? 'Adding...' : 'Add Skill'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Skill Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Skill</DialogTitle>
            <DialogDescription>Update this skill&apos;s information.</DialogDescription>
          </DialogHeader>

          {currentSkill && (
            <div className="grid gap-4 py-4">
              {/* Skill Type */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-skill-type" className="text-right">Type</label>
                <Select
                  value={currentSkill.type}
                  onValueChange={(value: any) => setCurrentSkill({ ...currentSkill, type: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select skill type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Skill</SelectItem>
                    <SelectItem value="soft">Soft Skill</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Skill Name */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-skill-name" className="text-right">Name</label>
                <Input
                  id="edit-skill-name"
                  value={currentSkill.name}
                  onChange={(e) => setCurrentSkill({ ...currentSkill, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              {/* Skill Level */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-skill-level" className="text-right">Proficiency</label>
                <Select
                  value={currentSkill.level}
                  onValueChange={(value: any) => setCurrentSkill({ ...currentSkill, level: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSkill} disabled={!currentSkill?.name.trim() || isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
