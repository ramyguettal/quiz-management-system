import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { toast } from "sonner";

interface Question {
  id: number;
  type: 'mcq' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  timeLimit: number;
}

export function CreateQuiz() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      timeLimit: 60
    }
  ]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: questions.length + 1,
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      timeLimit: 60
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

  const updateOption = (questionId: number, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
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
              <Label htmlFor="startDate">Start Date & Time</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date & Time</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
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
              <div className="grid md:grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label>Time Limit (seconds)</Label>
                  <Input
                    type="number"
                    value={question.timeLimit}
                    onChange={(e) => updateQuestion(question.id, 'timeLimit', parseInt(e.target.value))}
                    min="10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Question</Label>
                <Textarea
                  placeholder="Enter your question"
                  value={question.question}
                  onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                  rows={2}
                />
              </div>

              {question.type === 'mcq' && question.options && (
                <div className="space-y-2">
                  <Label>Options</Label>
                  {question.options.map((option, optionIndex) => (
                    <Input
                      key={optionIndex}
                      placeholder={`Option ${optionIndex + 1}`}
                      value={option}
                      onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                    />
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <Input
                  placeholder="Enter correct answer"
                  value={question.correctAnswer}
                  onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                />
              </div>

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
