import { useState } from 'react';
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
  Hash
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
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';

interface EnhancedCreateQuizProps {
  quizId?: number;
  courseId?: number;
  onNavigate: (page: string, data?: any) => void;
  onBack: () => void;
}

interface Question {
  id: number;
  type: 'mcq' | 'qcs' | 'short-answer';
  text: string;
  points: number;
  options?: string[];
  correctAnswer?: number | number[]; // number for QCS, number[] for MCQ
  correctAnswerText?: string; // for short-answer
}

export default function EnhancedCreateQuiz({
  quizId,
  courseId,
  onNavigate,
  onBack
}: EnhancedCreateQuizProps) {
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(courseId?.toString() || '');
  const [timeLimit, setTimeLimit] = useState('30');
  const [attemptLimit, setAttemptLimit] = useState('3');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      type: 'mcq',
      text: '',
      points: 1,
      options: ['', '', '', ''],
      correctAnswer: []
    }
  ]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now(),
      type: 'mcq',
      text: '',
      points: 1,
      options: ['', '', '', ''],
      correctAnswer: []
    };
    setQuestions([...questions, newQuestion]);
  };

  const deleteQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: number, field: string, value: any) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          // When changing question type, reset correct answer
          if (field === 'type') {
            if (value === 'mcq') {
              return { ...q, [field]: value, correctAnswer: [], options: q.options || ['', '', '', ''] };
            } else if (value === 'qcs') {
              return { ...q, [field]: value, correctAnswer: undefined, options: q.options || ['', '', '', ''] };
            } else if (value === 'short-answer') {
              return { ...q, [field]: value, correctAnswer: undefined, correctAnswerText: '', options: undefined };
            }
          }
          return { ...q, [field]: value };
        }
        return q;
      })
    );
  };

  const updateOption = (questionId: number, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
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
          return { ...q, options: [...q.options, ''] };
        }
        return q;
      })
    );
  };

  const removeOption = (questionId: number, optionIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options && q.options.length > 2) {
          const newOptions = q.options.filter((_, index) => index !== optionIndex);
          // Update correct answers if needed
          let newCorrectAnswer = q.correctAnswer;
          if (q.type === 'mcq' && Array.isArray(newCorrectAnswer)) {
            newCorrectAnswer = newCorrectAnswer
              .filter((idx) => idx !== optionIndex)
              .map((idx) => (idx > optionIndex ? idx - 1 : idx));
          } else if (q.type === 'qcs' && newCorrectAnswer === optionIndex) {
            newCorrectAnswer = undefined;
          } else if (q.type === 'qcs' && typeof newCorrectAnswer === 'number' && newCorrectAnswer > optionIndex) {
            newCorrectAnswer = newCorrectAnswer - 1;
          }
          return { ...q, options: newOptions, correctAnswer: newCorrectAnswer };
        }
        return q;
      })
    );
  };

  const toggleCorrectAnswer = (questionId: number, optionIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.type === 'mcq') {
          const currentAnswers = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
          const newAnswers = currentAnswers.includes(optionIndex)
            ? currentAnswers.filter((idx) => idx !== optionIndex)
            : [...currentAnswers, optionIndex];
          return { ...q, correctAnswer: newAnswers };
        }
        return q;
      })
    );
  };

  const setQCSCorrectAnswer = (questionId: number, optionIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.type === 'qcs') {
          return { ...q, correctAnswer: optionIndex };
        }
        return q;
      })
    );
  };

  const handlePreview = () => {
    setIsPreviewMode(true);
  };

  const handleExitPreview = () => {
    setIsPreviewMode(false);
  };

  // Preview Mode Render
  if (isPreviewMode) {
    return (
      <div className="p-4 sm:p-6 bg-slate-900 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Preview Header */}
          <div className="mb-6">
            <Button
              onClick={handleExitPreview}
              variant="ghost"
              className="text-slate-400 hover:text-white hover:bg-slate-800 mb-4"
            >
              <ArrowLeft size={18} className="mr-2" />
              Exit Preview
            </Button>
            <div className="bg-amber-900/20 border border-amber-600 rounded-lg p-4 mb-4">
              <p className="text-amber-400 text-sm flex items-center gap-2">
                <Eye size={16} />
                Preview Mode - This is how students will see the quiz
              </p>
            </div>
          </div>

          {/* Quiz Header */}
          <Card className="bg-slate-800 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-2xl">{quizTitle || 'Untitled Quiz'}</CardTitle>
              {quizDescription && (
                <p className="text-slate-400 mt-2">{quizDescription}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock size={16} />
                  <span>Time Limit: {timeLimit} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Hash size={16} />
                  <span>Total Points: {questions.reduce((sum, q) => sum + q.points, 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions Preview */}
          <div className="space-y-6">
            {questions.map((question, index) => (
              <Card key={question.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-medium">
                        Question {index + 1}
                      </h3>
                      <Badge className="bg-blue-600 text-white">{question.points} pts</Badge>
                    </div>
                    <p className="text-slate-300">
                      {question.text || <span className="text-slate-500 italic">No question text</span>}
                    </p>
                  </div>

                  {/* MCQ Preview */}
                  {question.type === 'mcq' && question.options && (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-400 mb-3">Select all that apply:</p>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded border border-slate-600">
                          <Checkbox disabled className="border-slate-500" />
                          <span className="text-slate-300">
                            {option || <span className="text-slate-500 italic">Option {optionIndex + 1}</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* QCS Preview */}
                  {question.type === 'qcs' && question.options && (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-400 mb-3">Select one answer:</p>
                      <RadioGroup disabled>
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded border border-slate-600">
                            <RadioGroupItem
                              value={optionIndex.toString()}
                              disabled
                              className="border-slate-500"
                            />
                            <span className="text-slate-300">
                              {option || <span className="text-slate-500 italic">Option {optionIndex + 1}</span>}
                            </span>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {/* Short Answer Preview */}
                  {question.type === 'short-answer' && (
                    <div>
                      <p className="text-sm text-slate-400 mb-3">Your answer:</p>
                      <Textarea
                        disabled
                        placeholder="Type your answer here..."
                        className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {questions.length === 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-12 text-center">
                  <p className="text-slate-400">No questions added yet</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview Footer */}
          <div className="mt-8 pb-6 border-t border-slate-700 pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button 
                onClick={handleExitPreview}
                variant="outline" 
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Exit Preview
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled>
                Submit Quiz (Preview Only)
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-slate-900 min-h-screen">
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-white text-2xl sm:text-3xl mb-2">
              {quizId ? 'Edit Quiz' : 'Create New Quiz'}
            </h1>
            <p className="text-slate-400">Build your assessment with multiple question types</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Panel - Quiz Information */}
        <div className="md:col-span-1 space-y-6">
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
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white focus:border-blue-500">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="1">Advanced Database Systems (CS501)</SelectItem>
                    <SelectItem value="2">Web Development (CS201)</SelectItem>
                    <SelectItem value="3">Data Structures (CS301)</SelectItem>
                    <SelectItem value="4">Software Engineering (CS401)</SelectItem>
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
                <Label htmlFor="timeLimit" className="text-slate-300 flex items-center gap-2">
                  <Clock size={16} />
                  Time Limit (minutes)
                </Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attemptLimit" className="text-slate-300 flex items-center gap-2">
                  <Hash size={16} />
                  Maximum Attempts
                </Label>
                <Input
                  id="attemptLimit"
                  type="number"
                  value={attemptLimit}
                  onChange={(e) => setAttemptLimit(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white focus:border-blue-500"
                />
              </div>

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
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox id="shuffle" className="border-slate-600" />
                    <label htmlFor="shuffle" className="text-sm text-slate-300 cursor-pointer">
                      Shuffle questions
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="showResults" className="border-slate-600" />
                    <label htmlFor="showResults" className="text-sm text-slate-300 cursor-pointer">
                      Show results immediately
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="allowReview" className="border-slate-600" />
                    <label htmlFor="allowReview" className="text-sm text-slate-300 cursor-pointer">
                      Allow answer review
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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
                <span className="text-slate-400">Time Limit:</span>
                <span className="text-white">{timeLimit} mins</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Question Builder */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((question, index) => (
                <Card key={question.id} className="bg-slate-900/50 border-slate-600">
                  <CardContent className="p-6">
                    {/* Question Header */}
                    <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                      <div className="hidden sm:block cursor-move text-slate-500 mt-2">
                        <GripVertical size={20} />
                      </div>
                      <div className="flex-1 space-y-4 w-full">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-300">Question Type</Label>
                            <Select
                              value={question.type}
                              onValueChange={(value: string) =>
                                updateQuestion(question.id, 'type', value as 'mcq' | 'qcs' | 'short-answer')
                              }
                            >
                              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                <SelectItem value="mcq">Multiple Choice (Multiple Answers)</SelectItem>
                                <SelectItem value="qcs">Single Choice (One Answer)</SelectItem>
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

                        {/* MCQ Options - Multiple Correct Answers */}
                        {question.type === 'mcq' && question.options && (
                          <div className="space-y-3">
                            <Label className="text-slate-300">Answer Options (Select all correct answers)</Label>
                            <div className="space-y-3">
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-3">
                                  <Checkbox
                                    checked={Array.isArray(question.correctAnswer) && question.correctAnswer.includes(optionIndex)}
                                    onCheckedChange={() => toggleCorrectAnswer(question.id, optionIndex)}
                                    className="border-slate-600"
                                  />
                                  <Input
                                    placeholder={`Option ${optionIndex + 1}`}
                                    value={option}
                                    onChange={(e) =>
                                      updateOption(question.id, optionIndex, e.target.value)
                                    }
                                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                                  />
                                  {question.options && question.options.length > 2 && (
                                    <Button
                                      onClick={() => removeOption(question.id, optionIndex)}
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-400 hover:text-red-300 hover:bg-slate-800 shrink-0"
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
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
                            {Array.isArray(question.correctAnswer) && question.correctAnswer.length === 0 && (
                              <p className="text-xs text-amber-400">
                                ⚠ Please select at least one correct answer
                              </p>
                            )}
                          </div>
                        )}

                        {/* QCS Options - Single Correct Answer */}
                        {question.type === 'qcs' && question.options && (
                          <div className="space-y-3">
                            <Label className="text-slate-300">Answer Options (Select the correct answer)</Label>
                            <RadioGroup
                              value={typeof question.correctAnswer === 'number' ? question.correctAnswer.toString() : ''}
                              onValueChange={(value: string) =>
                                setQCSCorrectAnswer(question.id, parseInt(value))
                              }
                            >
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-3">
                                  <RadioGroupItem
                                    value={optionIndex.toString()}
                                    id={`q${question.id}-option${optionIndex}`}
                                    className="border-slate-600"
                                  />
                                  <Input
                                    placeholder={`Option ${optionIndex + 1}`}
                                    value={option}
                                    onChange={(e) =>
                                      updateOption(question.id, optionIndex, e.target.value)
                                    }
                                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                                  />
                                  {question.options && question.options.length > 2 && (
                                    <Button
                                      onClick={() => removeOption(question.id, optionIndex)}
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-400 hover:text-red-300 hover:bg-slate-800 shrink-0"
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </RadioGroup>
                            <div className="flex gap-2">
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
                            {typeof question.correctAnswer !== 'number' && (
                              <p className="text-xs text-amber-400">
                                ⚠ Please select the correct answer
                              </p>
                            )}
                          </div>
                        )}

                        {/* Short Answer */}
                        {question.type === 'short-answer' && (
                          <div className="space-y-2">
                            <Label className="text-slate-300">Expected Answer *</Label>
                            <Input
                              placeholder="Enter the correct answer..."
                              value={question.correctAnswerText || ''}
                              onChange={(e) =>
                                updateQuestion(question.id, 'correctAnswerText', e.target.value)
                              }
                              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                            />
                            <p className="text-xs text-slate-500">
                              This will be used for auto-grading and reference during manual review
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-12">
                  <Plus className="mx-auto text-slate-600 mb-4" size={48} />
                  <h3 className="text-white text-lg mb-2">No questions yet</h3>
                  <p className="text-slate-400 mb-4">Click "Add Question" to start building your quiz</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Add Question Button at Bottom */}
          <div className="flex justify-center">
            <Button
              onClick={addQuestion}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            >
              <Plus size={18} className="mr-2" />
              Add Question
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="mt-8 pb-6 border-t border-slate-700 pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
            <Save size={18} className="mr-2" />
            Save as Draft
          </Button>
          <Button 
            onClick={handlePreview}
            variant="outline" 
            className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <Eye size={18} className="mr-2" />
            Preview
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Send size={18} className="mr-2" />
            Publish Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}
