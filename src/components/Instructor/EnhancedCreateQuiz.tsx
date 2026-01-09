import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Eye,
  Send,
  Calendar,
  Clock,
  FileText,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { courseService } from '@/api/services/CourseServices';
import { quizService } from '@/api/services/QuizzServices';
import { groupService } from '@/api/services/GroupService';
import { questionService } from '@/api/services/QuestionServices';
import type { CourseListItem, Group } from '@/types/ApiTypes';
import { toast } from 'sonner';

interface EnhancedCreateQuizProps {
  quizId?: string;
  courseId?: string;
  instructorId: string;
  isEditMode?: boolean;
  onNavigate: (page: string, data?: any) => void;
  onBack: () => void;
}

interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  backendId?: string; // ID from backend after saving
  type: 'mcq' | 'short-answer';
  text: string;
  points: number;
  options?: QuestionOption[];
  isTimed: boolean;
  timeInMinutes: number;
  // For short-answer questions
  gradingType?: 'manual' | 'auto';
  expectedAnswer?: string;
  isSaved?: boolean; // Track if question is saved to backend
}

export default function EnhancedCreateQuiz({
  quizId,
  courseId,
  instructorId,
  onNavigate,
  onBack
}: EnhancedCreateQuizProps) {
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allowEditAfterSubmit, setAllowEditAfterSubmit] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [showResultsImmediately, setShowResultsImmediately] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>(courseId || '');
  const [createdQuizId, setCreatedQuizId] = useState<string | null>(null);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false);

  // Fetch existing quiz data if quizId is provided (edit mode)
  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quizId) return;

      try {
        setIsLoadingQuiz(true);
        const quizData = await quizService.getQuiz(quizId);
        
        // Populate form with existing quiz data
        setQuizTitle(quizData.title);
        setQuizDescription(quizData.description || '');
        setSelectedCourse(quizData.courseId);
        setStartDate(quizData.startDate ? new Date(quizData.startDate).toISOString().slice(0, 16) : '');
        setEndDate(quizData.endDate ? new Date(quizData.endDate).toISOString().slice(0, 16) : '');
        setShuffleQuestions(quizData.settings?.shuffleQuestions || false);
        setShowResultsImmediately(quizData.settings?.showResultsImmediately || false);
        setAllowEditAfterSubmit(quizData.settings?.allowReview || false);
        
        // Set the quiz ID for editing
        setCreatedQuizId(quizId);
        
        // Set published status
        if (quizData.status === 'published') {
          setIsPublished(true);
        }
        
        // Set selected groups if available
        if (quizData.groups && Array.isArray(quizData.groups)) {
          setSelectedGroups(quizData.groups.map(g => g.toString()));
        }
        
        // TODO: Fetch questions for this quiz
        // For now, we'll start with empty questions array
        setQuestions([]);
        
      } catch (error: any) {
        console.error('Failed to fetch quiz:', error);
        toast.error('Failed to load quiz data');
      } finally {
        setIsLoadingQuiz(false);
      }
    };

    fetchQuizData();
  }, [quizId]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoadingCourses(true);
        const coursesData = await courseService.getInstructorCourses(instructorId);
        setCourses(coursesData);
        
        // If courseId prop is provided, make sure it's set
        if (courseId && !selectedCourse) {
          setSelectedCourse(courseId);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setIsLoadingCourses(false);
      }
    };

    const fetchGroups = async () => {
      try {
        setIsLoadingGroups(true);
        const groupsData = await groupService.getGroups();
        setGroups(groupsData.data || []);
      } catch (error) {
        console.error('Failed to fetch groups:', error);
        toast.error('Failed to load groups');
      } finally {
        setIsLoadingGroups(false);
      }
    };

    fetchCourses();
    fetchGroups();
  }, [courseId, selectedCourse, instructorId]);
  
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      type: 'mcq',
      text: '',
      points: 1,
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      isTimed: false,
      timeInMinutes: 5
    }
  ]);

  const toggleGroup = (groupId: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupId) ? prev.filter(g => g !== groupId) : [...prev, groupId]
    );
  };

  const handleCreateQuiz = async () => {
    // Validation
    if (!quizTitle.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }
    if (!selectedCourse) {
      toast.error('Please select a course');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    try {
      setIsCreatingQuiz(true);

      const quizData = {
        courseId: selectedCourse,
        title: quizTitle,
        description: quizDescription,
        availableFromUtc: new Date(startDate).toISOString(),
        availableToUtc: new Date(endDate).toISOString(),
        shuffleQuestions,
        showResultsImmediately,
        allowEditAfterSubmission: allowEditAfterSubmit,
        groupIds: selectedGroups
      };

      if (createdQuizId) {
        // Update existing quiz
        await quizService.updateQuiz(createdQuizId, quizData);
        toast.success('Quiz updated successfully!');
      } else {
        // Create new quiz
        const newQuizId = await quizService.createQuiz(quizData);
        setCreatedQuizId(newQuizId);
        console.log('Created Quiz ID:', newQuizId);
        toast.success('Quiz created successfully! You can now add questions.');
      }
      
    } catch (error: any) {
      console.error('Failed to save quiz:', error);
      toast.error(error?.message || `Failed to ${createdQuizId ? 'update' : 'create'} quiz`);
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  const addQuestion = async () => {
    // Check if quiz is created first
    if (!createdQuizId) {
      toast.error('Please create the quiz first before adding questions');
      return;
    }

    const newQuestion: Question = {
      id: Date.now(),
      type: 'mcq',
      text: '',
      points: 1,
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      isTimed: false,
      timeInMinutes: 5,
      isSaved: false
    };
    
    setQuestions([...questions, newQuestion]);
  };

  const saveQuestion = async (question: Question) => {
    if (!createdQuizId) {
      toast.error('Quiz ID is missing');
      return;
    }

    // Validate question
    if (!question.text.trim()) {
      toast.error('Please enter question text');
      return;
    }

    if (question.points <= 0) {
      toast.error('Points must be greater than 0');
      return;
    }

    try {
      setIsSavingQuestion(true);

      if (question.type === 'mcq') {
        // Validate MCQ options
        if (!question.options || question.options.length < 2) {
          toast.error('Multiple choice questions must have at least 2 options');
          return;
        }

        const filledOptions = question.options.filter(opt => opt.text.trim());
        if (filledOptions.length < 2) {
          toast.error('Please fill in at least 2 options');
          return;
        }

        const questionData = {
          text: question.text,
          points: question.points,
          shuffleOptions: shuffleQuestions,
          options: filledOptions
        };

        if (question.backendId) {
          // Update existing question
          await questionService.updateMultipleChoiceQuestion(question.backendId, questionData);
          toast.success('Question updated successfully!');
        } else {
          // Create new question
          await questionService.createMultipleChoiceQuestion(createdQuizId, questionData);
          toast.success('Question saved successfully!');
        }
      } else {
        // Short answer question
        const questionData = {
          text: question.text,
          points: question.points,
          expectedAnswer: question.expectedAnswer || ''
        };

        if (question.backendId) {
          // Update existing question
          await questionService.updateShortAnswerQuestion(question.backendId, questionData);
          toast.success('Question updated successfully!');
        } else {
          // Create new question
          await questionService.createShortAnswerQuestion(createdQuizId, questionData);
          toast.success('Question saved successfully!');
        }
      }

      // Mark question as saved
      setQuestions(questions.map(q => 
        q.id === question.id ? { ...q, isSaved: true } : q
      ));

    } catch (error: any) {
      console.error('Failed to save question:', error);
      toast.error(error?.message || 'Failed to save question');
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handlePublishQuiz = async () => {
    if (!createdQuizId) {
      toast.error('Please create the quiz first');
      return;
    }

    // Check if all questions are saved
    const unsavedQuestions = questions.filter(q => !q.isSaved);
    if (unsavedQuestions.length > 0) {
      toast.error(`Please save all questions first. ${unsavedQuestions.length} question(s) not saved.`);
      return;
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question before publishing');
      return;
    }

    try {
      setIsPublishing(true);
      await quizService.publishQuiz(createdQuizId);
      setIsPublished(true);
      toast.success('Quiz published successfully!');
    } catch (error: any) {
      console.error('Failed to publish quiz:', error);
      toast.error(error?.message || 'Failed to publish quiz');
    } finally {
      setIsPublishing(false);
    }
  };

  const deleteQuestion = async (id: number) => {
    const question = questions.find(q => q.id === id);
    
    // If question has a backend ID, delete from backend
    if (question?.backendId) {
      try {
        setIsDeletingQuestion(true);
        await questionService.deleteQuestion(question.backendId);
        toast.success('Question deleted successfully');
      } catch (error: any) {
        console.error('Failed to delete question:', error);
        toast.error(error?.message || 'Failed to delete question');
        return;
      } finally {
        setIsDeletingQuestion(false);
      }
    }
    
    // Remove from local state
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: number, field: string, value: any) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          return { ...q, [field]: value };
        }
        return q;
      })
    );
  };

  const updateOption = (questionId: number, optionIndex: number, field: 'text' | 'isCorrect', value: any) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = { ...newOptions[optionIndex], [field]: value };
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const addOption = (questionId: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          return { ...q, options: [...q.options, { text: '', isCorrect: false }] };
        }
        return q;
      })
    );
  };

  const removeOption = (questionId: number, optionIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options && q.options.length > 2) {
          const newOptions = q.options.filter((_, idx) => idx !== optionIndex);
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Loading State */}
      {isLoadingQuiz && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            <p className="text-slate-400">Loading quiz data...</p>
          </div>
        </div>
      )}

      {!isLoadingQuiz && (
        <>
      {/* Header */}
      <div className="mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-slate-400 hover:text-white hover:bg-slate-800 mb-4"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-3xl mb-2">
              {quizId ? 'Edit Quiz' : 'Create New Quiz'}
            </h1>
            <p className="text-slate-400">Build your assessment with multiple question types</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
              <Save size={18} className="mr-2" />
              Save as Draft
            </Button>
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
              <Eye size={18} className="mr-2" />
              Preview
            </Button>
            <Button 
              onClick={handlePublishQuiz}
              disabled={isPublishing || isPublished || !createdQuizId || questions.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Publishing...
                </>
              ) : isPublished ? (
                <>
                  <Check size={18} className="mr-2" />
                  Published
                </>
              ) : (
                <>
                  <Send size={18} className="mr-2" />
                  Publish Quiz
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Quiz Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Information */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Quiz Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-300">Quiz Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Midterm Database Quiz"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the quiz..."
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course" className="text-slate-300">Course *</Label>
                <Select 
                  value={selectedCourse} 
                  onValueChange={setSelectedCourse}
                  disabled={!!quizId}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue placeholder={isLoadingCourses ? "Loading courses..." : "Select course"} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    {isLoadingCourses ? (
                      <SelectItem value="loading" disabled>Loading courses...</SelectItem>
                    ) : courses.length === 0 ? (
                      <SelectItem value="no-courses" disabled>No courses available</SelectItem>
                    ) : (
                      courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title} ({course.code})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Settings */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Quiz Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-slate-300 flex items-center gap-2">
                  <Calendar size={16} />
                  Available From
                </Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-slate-300 flex items-center gap-2">
                  <Calendar size={16} />
                  Available Until
                </Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white focus:border-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-slate-300">Allow Edit After Submission</Label>
                    <p className="text-xs text-slate-500">
                      Students can modify answers after submitting
                    </p>
                  </div>
                  <Switch
                    checked={allowEditAfterSubmit}
                    onCheckedChange={setAllowEditAfterSubmit}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700 space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="shuffle" 
                    checked={shuffleQuestions}
                    onCheckedChange={(checked) => setShuffleQuestions(checked as boolean)}
                    className="border-slate-600" 
                  />
                  <label htmlFor="shuffle" className="text-sm text-slate-300 cursor-pointer">
                    Shuffle questions
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="showResults" 
                    checked={showResultsImmediately}
                    onCheckedChange={(checked) => setShowResultsImmediately(checked as boolean)}
                    className="border-slate-600" 
                  />
                  <label htmlFor="showResults" className="text-sm text-slate-300 cursor-pointer">
                    Show results immediately
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="allowReview" 
                    checked={allowEditAfterSubmit}
                    onCheckedChange={(checked) => setAllowEditAfterSubmit(checked as boolean)}
                    className="border-slate-600" 
                  />
                  <label htmlFor="allowReview" className="text-sm text-slate-300 cursor-pointer">
                    Allow answer review
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Audience */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Target Audience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-slate-300">Target Groups</Label>
                {isLoadingGroups ? (
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                    Loading groups...
                  </div>
                ) : groups.length === 0 ? (
                  <p className="text-sm text-slate-500">No groups available</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {groups.map(group => (
                      <div key={group.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`group-${group.id}`}
                          checked={selectedGroups.includes(group.id)}
                          onCheckedChange={() => toggleGroup(group.id)}
                          className="border-slate-600"
                        />
                        <label
                          htmlFor={`group-${group.id}`}
                          className="text-sm text-slate-300 cursor-pointer"
                        >
                          Group {group.groupNumber} ({group.academicYearNumber})
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Questions:</span>
                  <Badge className="bg-blue-600 text-white">{questions.length}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Points:</span>
                  <Badge className="bg-purple-600 text-white">
                    {questions.reduce((sum, q) => sum + q.points, 0)}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Target Groups:</span>
                  <span className="text-white">{selectedGroups.length > 0 ? selectedGroups.length : 'None'}</span>
                </div>
              </div>

              {/* Create/Update Quiz Button */}
              <Button 
                onClick={handleCreateQuiz} 
                disabled={isCreatingQuiz}
                className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingQuiz ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {createdQuizId ? 'Updating...' : 'Creating Quiz...'}
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    {createdQuizId ? 'Update Quiz' : 'Create Quiz'}
                  </>
                )}
              </Button>

              {createdQuizId && (
                <div className="text-xs text-green-400 text-center">
                  Quiz ID: {createdQuizId}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Question Builder */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((question, index) => (
                <Card key={question.id} className="bg-slate-900/50 border-slate-600">
                  <CardContent className="p-6">
                    {/* Question Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="cursor-move text-slate-500 mt-2">
                        <GripVertical size={20} />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-slate-700 text-slate-300">
                            Question {index + 1}
                          </Badge>
                          <Button
                            onClick={() => deleteQuestion(question.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-slate-800"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>

                        {/* Question Type and Points */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-300">Question Type</Label>
                            <Select
                              value={question.type}
                              onValueChange={(value: string) =>
                                updateQuestion(question.id, 'type', value as 'mcq' | 'short-answer')
                              }
                            >
                              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                <SelectItem value="mcq">Multiple Choice</SelectItem>
                                <SelectItem value="short-answer">Short Answer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-300">Points</Label>
                            <Input
                              type="number"
                              value={question.points}
                              onChange={(e) =>
                                updateQuestion(question.id, 'points', parseInt(e.target.value))
                              }
                              className="bg-slate-800 border-slate-600 text-white"
                            />
                          </div>
                        </div>

                        {/* Timed Question Option */}
                        <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-800">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`timed-${question.id}`}
                              checked={question.isTimed}
                              onCheckedChange={(checked) => updateQuestion(question.id, 'isTimed', checked)}
                              className="border-slate-600"
                            />
                            <label
                              htmlFor={`timed-${question.id}`}
                              className="text-sm text-slate-300 cursor-pointer flex items-center gap-1"
                            >
                              <Clock size={14} />
                              Timed Question
                            </label>
                          </div>
                          {question.isTimed && (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={question.timeInMinutes}
                                onChange={(e) => updateQuestion(question.id, 'timeInMinutes', parseInt(e.target.value) || 1)}
                                min="1"
                                className="w-20 bg-slate-900 border-slate-600 text-white"
                              />
                              <span className="text-sm text-slate-400">minutes</span>
                            </div>
                          )}
                        </div>

                        {/* Short Answer Grading Type */}
                        {question.type === 'short-answer' && (
                          <div className="space-y-2">
                            <Label className="text-slate-300">Grading Method</Label>
                            <Select
                              value={question.gradingType || 'manual'}
                              onValueChange={(value: string) =>
                                updateQuestion(question.id, 'gradingType', value)
                              }
                            >
                              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                <SelectItem value="manual">Manually Graded</SelectItem>
                                <SelectItem value="auto">Auto Graded</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500">
                              {question.gradingType === 'auto'
                                ? 'Answer will be automatically compared to expected answer'
                                : 'Instructor will manually review and grade the answer'}
                            </p>
                          </div>
                        )}

                        {/* Question Text */}
                        <div className="space-y-2">
                          <Label className="text-slate-300">Question Text *</Label>
                          <Textarea
                            placeholder="Enter your question..."
                            value={question.text}
                            onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                          />
                        </div>

                        {/* MCQ Options with Multiple Correct Answers */}
                        {question.type === 'mcq' && question.options && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-slate-300">Answer Options (check correct answer(s))</Label>
                              <Button
                                onClick={() => addOption(question.id)}
                                variant="outline"
                                size="sm"
                                className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                              >
                                <Plus size={14} className="mr-1" />
                                Add Option
                              </Button>
                            </div>
                            <p className="text-xs text-slate-500">
                              You can select multiple correct answers or leave all unchecked if there's no correct answer
                            </p>
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center gap-3">
                                <Checkbox
                                  id={`q${question.id}-option${optionIndex}-correct`}
                                  checked={option.isCorrect}
                                  onCheckedChange={(checked) =>
                                    updateOption(question.id, optionIndex, 'isCorrect', checked)
                                  }
                                  className="border-slate-600"
                                />
                                <Input
                                  placeholder={`Option ${optionIndex + 1}`}
                                  value={option.text}
                                  onChange={(e) =>
                                    updateOption(question.id, optionIndex, 'text', e.target.value)
                                  }
                                  className={`bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 ${
                                    option.isCorrect ? 'border-green-500 bg-green-950/30' : ''
                                  }`}
                                />
                                {question.options && question.options.length > 2 && (
                                  <Button
                                    onClick={() => removeOption(question.id, optionIndex)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-400 hover:text-red-300 hover:bg-slate-800 px-2"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Short Answer */}
                        {question.type === 'short-answer' && (
                          <div className="space-y-2">
                            <Label className="text-slate-300">Expected Answer (Optional)</Label>
                            <Input
                              placeholder="Sample correct answer..."
                              value={question.expectedAnswer || ''}
                              onChange={(e) => updateQuestion(question.id, 'expectedAnswer', e.target.value)}
                              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                            />
                            <p className="text-xs text-slate-500">
                              This will be used for reference during manual grading
                            </p>
                          </div>
                        )}

                        {/* Save Question Button */}
                        <div className="pt-4 border-t border-slate-700">
                          <Button
                            onClick={() => saveQuestion(question)}
                            disabled={isSavingQuestion || question.isSaved || !createdQuizId}
                            className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {question.isSaved ? (
                              <>
                                <Check size={16} className="mr-2" />
                                Question Saved
                              </>
                            ) : isSavingQuestion ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save size={16} className="mr-2" />
                                Save Question
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto text-slate-600 mb-4" size={48} />
                  <h3 className="text-white text-lg mb-2">No questions yet</h3>
                  <p className="text-slate-400 mb-4">Click "Add Question" to start building your quiz</p>
                </div>
              )}

              {/* Add Question Button at Bottom */}
              <div className="pt-4">
                <Button
                  onClick={addQuestion}
                  disabled={!createdQuizId}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={18} className="mr-2" />
                  Add Question
                </Button>
                {!createdQuizId && (
                  <p className="text-xs text-slate-500 text-center mt-2">
                    Create the quiz first before adding questions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
        </>
      )}
    </div>
  );
}