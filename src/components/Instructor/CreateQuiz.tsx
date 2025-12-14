import { useState } from "react";
import { Plus, Trash2, Save, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";

interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  type: 'mcq' | 'short-answer';
  question: string;
  options?: QuestionOption[];
  explanation: string;
  isTimed: boolean;
  timeInMinutes: number;
  // For short-answer questions
  gradingType?: 'manual' | 'auto';
}

export function CreateQuiz() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allowEditAfterSubmit, setAllowEditAfterSubmit] = useState(false);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      type: 'mcq',
      question: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      explanation: '',
      isTimed: false,
      timeInMinutes: 5
    }
  ]);

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
  const groups = ['Group A', 'Group B', 'Group C', 'Group D'];

  const toggleYear = (year: string) => {
    setSelectedYears(prev =>
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  const toggleGroup = (group: string) => {
    setSelectedGroups(prev =>
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: questions.length + 1,
      type: 'mcq',
      question: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      explanation: '',
      isTimed: false,
      timeInMinutes: 5
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: number, field: string, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionId: number, optionIndex: number, field: 'text' | 'isCorrect', value: any) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = { ...newOptions[optionIndex], [field]: value };
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const addOption = (questionId: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        return { ...q, options: [...q.options, { text: '', isCorrect: false }] };
      }
      return q;
    }));
  };

  const removeOption = (questionId: number, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options && q.options.length > 2) {
        const newOptions = q.options.filter((_, idx) => idx !== optionIndex);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Quiz created successfully!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title</Label>
            <Input
              id="title"
              placeholder="Enter quiz title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter quiz description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Available From</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Available Until</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <Separator />

          {/* Allow Edit After Submit */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Edit After Submission</Label>
              <p className="text-sm text-muted-foreground">
                Students can modify their answers after submitting
              </p>
            </div>
            <Switch
              checked={allowEditAfterSubmit}
              onCheckedChange={setAllowEditAfterSubmit}
            />
          </div>

          <Separator />

          {/* Target Years */}
          <div className="space-y-3">
            <Label>Target Years</Label>
            <div className="flex flex-wrap gap-3">
              {years.map(year => (
                <div key={year} className="flex items-center space-x-2">
                  <Checkbox
                    id={`year-${year}`}
                    checked={selectedYears.includes(year)}
                    onCheckedChange={() => toggleYear(year)}
                  />
                  <label
                    htmlFor={`year-${year}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {year}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Target Groups */}
          <div className="space-y-3">
            <Label>Target Groups</Label>
            <div className="flex flex-wrap gap-3">
              {groups.map(group => (
                <div key={group} className="flex items-center space-x-2">
                  <Checkbox
                    id={`group-${group}`}
                    checked={selectedGroups.includes(group)}
                    onCheckedChange={() => toggleGroup(group)}
                  />
                  <label
                    htmlFor={`group-${group}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {group}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={question.id} className="border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                {questions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(question.id)}
                    className="hover:bg-destructive/10 hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select
                  value={question.type}
                  onValueChange={(value: any) => updateQuestion(question.id, 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                    <SelectItem value="short-answer">Short Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Timed Question Option */}
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`timed-${question.id}`}
                    checked={question.isTimed}
                    onCheckedChange={(checked) => updateQuestion(question.id, 'isTimed', checked)}
                  />
                  <label
                    htmlFor={`timed-${question.id}`}
                    className="text-sm font-medium leading-none cursor-pointer flex items-center gap-1"
                  >
                    <Clock className="h-4 w-4" />
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
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>
                )}
              </div>

              {/* Short Answer Grading Type */}
              {question.type === 'short-answer' && (
                <div className="space-y-2">
                  <Label>Grading Method</Label>
                  <Select
                    value={question.gradingType || 'manual'}
                    onValueChange={(value: any) => updateQuestion(question.id, 'gradingType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manually Graded</SelectItem>
                      <SelectItem value="auto">Auto Graded</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {question.gradingType === 'auto'
                      ? 'Answer will be automatically compared to expected answer'
                      : 'Instructor will manually review and grade the answer'}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Question</Label>
                <Textarea
                  placeholder="Enter your question"
                  value={question.question}
                  onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                  rows={2}
                />
              </div>

              {/* MCQ Options with Multiple Correct Answers */}
              {question.type === 'mcq' && question.options && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Options (check the correct answer(s))</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addOption(question.id)}
                      className="h-8"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Option
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can select multiple correct answers or leave all unchecked if there's no correct answer
                  </p>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <Checkbox
                        id={`option-correct-${question.id}-${optionIndex}`}
                        checked={option.isCorrect}
                        onCheckedChange={(checked) => updateOption(question.id, optionIndex, 'isCorrect', checked)}
                      />
                      <Input
                        placeholder={`Option ${optionIndex + 1}`}
                        value={option.text}
                        onChange={(e) => updateOption(question.id, optionIndex, 'text', e.target.value)}
                        className={option.isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}
                      />
                      {question.options && question.options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(question.id, optionIndex)}
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label>Explanation (Optional)</Label>
                <Textarea
                  placeholder="Explain the answer"
                  value={question.explanation}
                  onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={addQuestion}
          className="border-primary text-primary hover:bg-primary/5 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>

        <Button type="submit" className="bg-primary hover:bg-primary/90 transition-all">
          <Save className="h-4 w-4 mr-2" />
          Save Quiz
        </Button>
      </div>
    </form>
  );
}
