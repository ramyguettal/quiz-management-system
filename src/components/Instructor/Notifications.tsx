import { useState } from "react";
import { Send, Users } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { toast } from "sonner";

export function Notifications() {
  const [recipient, setRecipient] = useState('all-students');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Notification sent successfully!");
    setSubject('');
    setMessage('');
  };

  const recentNotifications = [
    { id: 1, subject: 'Quiz Reminder', recipient: 'All Students', date: '2025-10-28 10:30 AM' },
    { id: 2, subject: 'Deadline Extension', recipient: 'React Quiz Students', date: '2025-10-27 03:15 PM' },
    { id: 3, subject: 'Grade Released', recipient: 'JavaScript Quiz Students', date: '2025-10-26 09:00 AM' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Send Notification</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipients</Label>
              <Select value={recipient} onValueChange={setRecipient}>
                <SelectTrigger id="recipient">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-students">All Students</SelectItem>
                  <SelectItem value="react-quiz">Students in React Quiz</SelectItem>
                  <SelectItem value="js-quiz">Students in JavaScript Quiz</SelectItem>
                  <SelectItem value="css-quiz">Students in CSS Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter notification subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 transition-all">
              <Send className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentNotifications.map((notification, index) => (
              <div key={notification.id}>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p>{notification.subject}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{notification.recipient}</span>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{notification.date}</span>
                </div>
                {index < recentNotifications.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
