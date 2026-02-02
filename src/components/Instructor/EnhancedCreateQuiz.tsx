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
      if (!quizId) {
        return;
      }

      try {
        setIsLoadingQuiz(true);
        
        const quizData = await quizService.getQuiz(quizId) as any;
        
        // Populate form with existing quiz data
        setQuizTitle(quizData.title);
        setQuizDescription(quizData.description || '');
        setSelectedCourse(quizData.courseId);
        
        // Handle date fields - check if they exist and map to availableFromUtc/availableToUtc
        if (quizData.availableFromUtc) {
          setStartDate(new Date(quizData.availableFromUtc).toISOString().slice(0, 16));
        } else if (quizData.startDate) {
          setStartDate(new Date(quizData.startDate).toISOString().slice(0, 16));
        }
        
        if (quizData.availableToUtc) {
          setEndDate(new Date(quizData.availableToUtc).toISOString().slice(0, 16));
        } else if (quizData.endDate) {
          setEndDate(new Date(quizData.endDate).toISOString().slice(0, 16));
        }
        
        // Map settings from the quiz response
        setShuffleQuestions(quizData.shuffleQuestions || quizData.settings?.shuffleQuestions || false);
        setShowResultsImmediately(quizData.showResultsImmediately || quizData.settings?.showResultsImmediately || false);
        setAllowEditAfterSubmit(quizData.allowEditAfterSubmission || quizData.settings?.allowReview || false);
        
        // Set the quiz ID for editing
        setCreatedQuizId(quizId);
        
        // Set published status
        if (quizData.status === 'published' || quizData.isPublished) {
          setIsPublished(true);
        }
        
        // Set selected groups if available
        if (quizData.groupIds && Array.isArray(quizData.groupIds)) {
          setSelectedGroups(quizData.groupIds.map((g: any) => g.toString()));
        } else if (quizData.groups && Array.isArray(quizData.groups)) {
          // Groups come as objects with {id, groupNumber}
          setSelectedGroups(quizData.groups.map((g: any) => g.id.toString()));
        }
        
        // Try to fetch questions - they might be included in quiz response or need separate fetch
        let questionsData: any[] = [];
        
        // Check if questions are included in the quiz response
        if (quizData.questions && Array.isArray(quizData.questions)) {
          questionsData = quizData.questions;
        } else {
          // Try to fetch questions separately
          try {
            questionsData = await questionService.getQuestionsByQuiz(quizId);
          } catch (questionError: any) {
            questionsData = [];
          }
        }
        
        // Map backend questions to component Question interface
        if (questionsData && questionsData.length > 0) {
          const mappedQuestions: Question[] = questionsData.map((q: any, index: number) => {
            
            // Determine question type - normalize to 'mcq' or 'short-answer'
            const questionType = q.type === 'multiple-choice' || q.type === 'MultipleChoice' 
              ? 'mcq' 
              : 'short-answer';
            
            // Map options for MCQ questions
            let mappedOptions = undefined;
            if (questionType === 'mcq' && q.options && Array.isArray(q.options)) {
              mappedOptions = q.options.map((opt: any) => ({
                text: opt.text || opt,
                isCorrect: opt.isCorrect || false
              }));
            }
            
            return {
              id: index + 1, // Local ID for React key
              backendId: q.id, // Store backend ID for updates
              type: questionType,
              text: q.text,
              points: q.points,
              options: mappedOptions,
              isTimed: false, // Not available in backend response
              timeInMinutes: 5, // Default value
              gradingType: questionType === 'short-answer' ? 'auto' : undefined,
              expectedAnswer: questionType === 'short-answer' ? q.expectedAnswer : undefined,
              isSaved: true // Existing questions are already saved
            };
          });
          
          setQuestions(mappedQuestions);
        } else {
          setQuestions([]);
        }
        
      } catch (error: any) {
        console.error('❌ Failed to fetch quiz data:', error);
        console.error('❌ Error details:', {
          message: error.message,
          response: error.response,
          status: error.response?.status
        });
        
        // Extract detailed error information
        let errorMessage = 'Failed to load quiz data';
        let errorDetails = '';
        
        if (error?.response) {
          // HTTP error response from server
          const status = error.response.status;
          const statusText = error.response.statusText;
          errorDetails = `HTTP ${status} ${statusText}`;
          
          if (error.response.data) {
            // Try to extract error message from response body
            if (typeof error.response.data === 'string') {
              errorDetails += `: ${error.response.data}`;
            } else if (error.response.data.message) {
              errorDetails += `: ${error.response.data.message}`;
            } else if (error.response.data.error) {
              errorDetails += `: ${error.response.data.error}`;
            } else if (error.response.data.title) {
              errorDetails += `: ${error.response.data.title}`;
            }
          }
          
          // Specific error messages based on status code
          if (status === 404) {
            errorMessage = 'Quiz not found';
          } else if (status === 403) {
            errorMessage = 'Access denied - you do not have permission to edit this quiz';
          } else if (status === 401) {
            errorMessage = 'Authentication required - please log in again';
          } else if (status >= 500) {
            errorMessage = 'Server error - please try again later';
          }
        } else if (error?.message) {
          // Network error or other error with message
          errorDetails = error.message;
        } else if (typeof error === 'string') {
          errorDetails = error;
        }
        
        // Display error to user
        const fullErrorMessage = errorDetails 
          ? `${errorMessage}: ${errorDetails}` 
          : errorMessage;
        
        toast.error(fullErrorMessage, {
          duration: 6000, // Show for 6 seconds for longer error messages
        });
        
        // Also log to console for debugging
        console.error('Quiz fetch error details:', {
          message: errorMessage,
          details: errorDetails,
          rawError: error,
          quizId
        });
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

    fetchCourses();
  }, [courseId, selectedCourse, instructorId]);

  // Fetch groups when course is selected
  useEffect(() => {
    const fetchGroups = async () => {
      if (!selectedCourse) {
        setGroups([]);
        setIsLoadingGroups(false);
        return;
      }

      // Wait for courses to be loaded before fetching groups
      if (isLoadingCourses || courses.length === 0) {
        return;
      }

      try {
        setIsLoadingGroups(true);
        
        // Find the selected course to get its academicYearId
        const selectedCourseData = courses.find(c => c.id === selectedCourse);
        
        console.log('📚 Selected Course:', selectedCourseData);
        
        if (selectedCourseData?.academicYearId) {
          console.log('🔍 Fetching groups for academicYearId:', selectedCourseData.academicYearId);
          const groupsData = await groupService.getGroups(selectedCourseData.academicYearId);
          console.log('✅ Groups received:', groupsData);
          console.log('📦 Groups count:', groupsData.length);
          setGroups(groupsData);
        } else {
          console.log('⚠️ No academicYearId found for selected course');
          setGroups([]);
        }
      } catch (error) {
        console.error('❌ Failed to fetch groups:', error);
        toast.error('Failed to load groups');
      } finally {
        setIsLoadingGroups(false);
      }
    };

    fetchGroups();
  }, [selectedCourse, courses, isLoadingCourses]);
  
  // Initialize questions state - empty for edit mode, one empty question for create mode
  const [questions, setQuestions] = useState<Question[]>(
    quizId ? [] : [
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
        timeInMinutes: 5,
        gradingType: 'auto'
      }
    ]
  );

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

      if (createdQuizId) {
        // Update existing quiz - courseId not allowed in update
        const quizData = {
          title: quizTitle,
          description: quizDescription,
          availableFromUtc: new Date(startDate).toISOString(),
          availableToUtc: new Date(endDate).toISOString(),
          shuffleQuestions,
          showResultsImmediately,
          allowEditAfterSubmission: allowEditAfterSubmit,
          groupIds: selectedGroups
        };
        
        await quizService.updateQuiz(createdQuizId, quizData);
        toast.success('Quiz updated successfully!');
      } else {
        // Create new quiz - courseId required
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
        
        const newQuizId = await quizService.createQuiz(quizData);
        setCreatedQuizId(newQuizId);
        toast.success('Quiz created successfully! You can now add questions.');
      }
      
    } catch (error: any) {
      console.error('Failed to save quiz:', error);
      
      // Extract detailed error information
      let errorMessage = `Failed to ${createdQuizId ? 'update' : 'create'} quiz`;
      let errorDetails = '';
      
      if (error?.response) {
        const status = error.response.status;
        errorDetails = `HTTP ${status}`;
        
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorDetails += `: ${error.response.data}`;
          } else if (error.response.data.message) {
            errorDetails += `: ${error.response.data.message}`;
          } else if (error.response.data.errors) {
            // Handle validation errors
            const validationErrors = Object.values(error.response.data.errors).flat().join(', ');
            errorDetails += `: ${validationErrors}`;
          } else if (error.response.data.title) {
            errorDetails += `: ${error.response.data.title}`;
          }
        }
      } else if (error?.message) {
        errorDetails = error.message;
      }
      
      const fullErrorMessage = errorDetails 
        ? `${errorMessage}: ${errorDetails}` 
        : errorMessage;
      
      toast.error(fullErrorMessage, { duration: 5000 });
      
      console.error('Quiz save error details:', {
        message: errorMessage,
        details: errorDetails,
        rawError: error,
        quizId: createdQuizId
      });
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
      gradingType: 'auto', // Default to auto grading
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

        if (question.backendId) {
          // Update existing question - shuffleOptions not allowed in update
          const questionData = {
            text: question.text,
            points: question.points,
            options: filledOptions
          };
          await questionService.updateMultipleChoiceQuestion(question.backendId, questionData);
          toast.success('Question updated successfully!');
        } else {
          // Create new question - shuffleOptions allowed in create
          const questionData = {
            text: question.text,
            points: question.points,
            shuffleOptions: shuffleQuestions,
            options: filledOptions
          };
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
      
      // Extract detailed error information
      let errorMessage = `Failed to ${question.backendId ? 'update' : 'save'} question`;
      let errorDetails = '';
      
      if (error?.response) {
        const status = error.response.status;
        errorDetails = `HTTP ${status}`;
        
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorDetails += `: ${error.response.data}`;
          } else if (error.response.data.message) {
            errorDetails += `: ${error.response.data.message}`;
          } else if (error.response.data.errors) {
            // Handle validation errors
            const validationErrors = Object.values(error.response.data.errors).flat().join(', ');
            errorDetails += `: ${validationErrors}`;
          } else if (error.response.data.title) {
            errorDetails += `: ${error.response.data.title}`;
          }
        }
        
        // Specific error messages
        if (status === 404) {
          errorMessage = question.backendId ? 'Question not found' : 'Quiz not found';
        } else if (status === 400) {
          errorMessage = 'Invalid question data';
        }
      } else if (error?.message) {
        errorDetails = error.message;
      }
      
      const fullErrorMessage = errorDetails 
        ? `${errorMessage}: ${errorDetails}` 
        : errorMessage;
      
      toast.error(fullErrorMessage, { duration: 5000 });
      
      console.error('Question save error details:', {
        message: errorMessage,
        details: errorDetails,
        rawError: error,
        questionId: question.backendId,
        quizId: createdQuizId,
        questionType: question.type
      });
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
      
      // Extract detailed error information
      let errorMessage = 'Failed to publish quiz';
      let errorDetails = '';
      
      if (error?.response) {
        const status = error.response.status;
        errorDetails = `HTTP ${status}`;
        
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorDetails += `: ${error.response.data}`;
          } else if (error.response.data.message) {
            errorDetails += `: ${error.response.data.message}`;
          } else if (error.response.data.title) {
            errorDetails += `: ${error.response.data.title}`;
          }
        }
        
        if (status === 404) {
          errorMessage = 'Quiz not found';
        } else if (status === 400) {
          errorMessage = 'Cannot publish quiz - please check all requirements are met';
        }
      } else if (error?.message) {
        errorDetails = error.message;
      }
      
      const fullErrorMessage = errorDetails 
        ? `${errorMessage}: ${errorDetails}` 
        : errorMessage;
      
      toast.error(fullErrorMessage, { duration: 5000 });
      
      console.error('Quiz publish error details:', {
        message: errorMessage,
        details: errorDetails,
        rawError: error,
        quizId: createdQuizId
      });
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
        
        // Extract detailed error information
        let errorMessage = 'Failed to delete question';
        let errorDetails = '';
        
        if (error?.response) {
          const status = error.response.status;
          errorDetails = `HTTP ${status}`;
          
          if (error.response.data) {
            if (typeof error.response.data === 'string') {
              errorDetails += `: ${error.response.data}`;
            } else if (error.response.data.message) {
              errorDetails += `: ${error.response.data.message}`;
            } else if (error.response.data.title) {
              errorDetails += `: ${error.response.data.title}`;
            }
          }
          
          if (status === 404) {
            errorMessage = 'Question not found';
          } else if (status === 403) {
            errorMessage = 'Not allowed to delete this question';
          }
        } else if (error?.message) {
          errorDetails = error.message;
        }
        
        const fullErrorMessage = errorDetails 
          ? `${errorMessage}: ${errorDetails}` 
          : errorMessage;
        
        toast.error(fullErrorMessage, { duration: 5000 });
        
        console.error('Question delete error details:', {
          message: errorMessage,
          details: errorDetails,
          rawError: error,
          questionId: question.backendId
        });
        
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
      {/* Loading State with Debug Info */}
      {isLoadingQuiz && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            <p className="text-slate-400">Loading quiz data...</p>
            <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-500 mb-2">Debug Info:</p>
              <p className="text-xs text-slate-300">Quiz ID: {quizId || 'none'}</p>
              <p className="text-xs text-slate-300">Course ID: {courseId || 'none'}</p>
              <p className="text-xs text-slate-300">Instructor ID: {instructorId || 'none'}</p>
            </div>
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
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Target Groups</Label>
                  {groups.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedGroups.length === groups.length) {
                          // Deselect all
                          setSelectedGroups([]);
                        } else {
                          // Select all
                          setSelectedGroups(groups.map(g => g.id));
                        }
                      }}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white text-xs"
                    >
                      {selectedGroups.length === groups.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  )}
                </div>

                {!selectedCourse ? (
                  <p className="text-sm text-slate-500">Please select a course first</p>
                ) : isLoadingGroups ? (
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                    Loading groups...
                  </div>
                ) : groups.length === 0 ? (
                  <p className="text-sm text-slate-500">No groups available for this course's academic year</p>
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
                            disabled={isSavingQuestion || !createdQuizId}
                            className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSavingQuestion ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save size={16} className="mr-2" />
                                {question.isSaved ? 'Update Question' : 'Save Question'}
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