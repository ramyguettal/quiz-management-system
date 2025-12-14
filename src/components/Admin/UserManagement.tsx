import { useState } from "react";
import { Plus, Pencil, Trash2, Search, BookOpen, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Checkbox } from "../ui/checkbox";

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  status: 'active' | 'inactive';
  // Student-specific fields
  year?: string;
  group?: string;
  // Instructor-specific fields
  title?: string;
  department?: string;
  assignedCourses?: string[];
}

interface Course {
  id: string;
  name: string;
  code: string;
}

const mockCourses: Course[] = [
  { id: '1', name: 'Introduction to Programming', code: 'CS101' },
  { id: '2', name: 'Data Structures', code: 'CS201' },
  { id: '3', name: 'Database Systems', code: 'CS301' },
  { id: '4', name: 'Web Development', code: 'CS401' },
  { id: '5', name: 'Machine Learning', code: 'CS501' },
];

const mockUsers: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'student', status: 'active', year: '2nd Year', group: 'Group A' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'instructor', status: 'active', title: 'Professor', department: 'Computer Science', assignedCourses: ['1', '2'] },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'admin', status: 'active' },
  { id: 4, name: 'Alice Williams', email: 'alice@example.com', role: 'student', status: 'inactive', year: '3rd Year', group: 'Group B' },
  { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'instructor', status: 'active', title: 'Associate Professor', department: 'Information Technology', assignedCourses: ['3'] },
];

export function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCoursesDialogOpen, setIsCoursesDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student' as 'admin' | 'instructor' | 'student',
    // Student fields
    year: '',
    group: '',
    // Instructor fields
    title: '',
    department: '',
    assignedCourses: [] as string[]
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = () => {
    const newUser: User = {
      id: users.length + 1,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: 'active',
      ...(formData.role === 'student' && { year: formData.year, group: formData.group }),
      ...(formData.role === 'instructor' && { title: formData.title, department: formData.department, assignedCourses: [] })
    };
    setUsers([...users, newUser]);
    setIsAddDialogOpen(false);
    resetFormData();
  };

  const handleEditUser = () => {
    if (selectedUser) {
      setUsers(users.map(user =>
        user.id === selectedUser.id
          ? {
              ...user,
              name: formData.name,
              email: formData.email,
              role: formData.role,
              ...(formData.role === 'student' && { year: formData.year, group: formData.group }),
              ...(formData.role === 'instructor' && { title: formData.title, department: formData.department })
            }
          : user
      ));
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      resetFormData();
    }
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const resetFormData = () => {
    setFormData({ name: '', email: '', role: 'student', year: '', group: '', title: '', department: '', assignedCourses: [] });
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      year: user.year || '',
      group: user.group || '',
      title: user.title || '',
      department: user.department || '',
      assignedCourses: user.assignedCourses || []
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const openCoursesDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      ...formData,
      assignedCourses: user.assignedCourses || []
    });
    setIsCoursesDialogOpen(true);
  };

  const handleCourseToggle = (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedCourses: prev.assignedCourses.includes(courseId)
        ? prev.assignedCourses.filter(id => id !== courseId)
        : [...prev.assignedCourses, courseId]
    }));
  };

  const handleSaveCourses = () => {
    if (selectedUser) {
      setUsers(users.map(user =>
        user.id === selectedUser.id
          ? { ...user, assignedCourses: formData.assignedCourses }
          : user
      ));
      setIsCoursesDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      admin: 'destructive',
      instructor: 'default',
      student: 'secondary'
    };
    return <Badge variant={variants[role]}>{role}</Badge>;
  };

  const getCourseName = (courseId: string) => {
    const course = mockCourses.find(c => c.id === courseId);
    return course ? `${course.code} - ${course.name}` : courseId;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>User Management</CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'outline' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {user.role === 'instructor' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openCoursesDialog(user)}
                          className="hover:bg-blue-500/10 hover:text-blue-500 transition-all"
                          title="Manage Courses"
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(user)}
                        className="hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(user)}
                        className="hover:bg-destructive/10 hover:text-destructive transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Full Name</Label>
              <Input
                id="add-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-role">Role</Label>
              <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                <SelectTrigger id="add-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Student-specific fields */}
            {formData.role === 'student' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="add-year">Year</Label>
                  <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
                    <SelectTrigger id="add-year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st Year">1st Year</SelectItem>
                      <SelectItem value="2nd Year">2nd Year</SelectItem>
                      <SelectItem value="3rd Year">3rd Year</SelectItem>
                      <SelectItem value="4th Year">4th Year</SelectItem>
                      <SelectItem value="5th Year">5th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-group">Group</Label>
                  <Select value={formData.group} onValueChange={(value) => setFormData({ ...formData, group: value })}>
                    <SelectTrigger id="add-group">
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Group A">Group A</SelectItem>
                      <SelectItem value="Group B">Group B</SelectItem>
                      <SelectItem value="Group C">Group C</SelectItem>
                      <SelectItem value="Group D">Group D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Instructor-specific fields */}
            {formData.role === 'instructor' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="add-title">Title</Label>
                  <Select value={formData.title} onValueChange={(value) => setFormData({ ...formData, title: value })}>
                    <SelectTrigger id="add-title">
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Teaching Assistant">Teaching Assistant</SelectItem>
                      <SelectItem value="Lecturer">Lecturer</SelectItem>
                      <SelectItem value="Senior Lecturer">Senior Lecturer</SelectItem>
                      <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                      <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                      <SelectItem value="Professor">Professor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-department">Department</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                    <SelectTrigger id="add-department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Information Technology">Information Technology</SelectItem>
                      <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} className="bg-primary hover:bg-primary/90">
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Student-specific fields */}
            {formData.role === 'student' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-year">Year</Label>
                  <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
                    <SelectTrigger id="edit-year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st Year">1st Year</SelectItem>
                      <SelectItem value="2nd Year">2nd Year</SelectItem>
                      <SelectItem value="3rd Year">3rd Year</SelectItem>
                      <SelectItem value="4th Year">4th Year</SelectItem>
                      <SelectItem value="5th Year">5th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-group">Group</Label>
                  <Select value={formData.group} onValueChange={(value) => setFormData({ ...formData, group: value })}>
                    <SelectTrigger id="edit-group">
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Group A">Group A</SelectItem>
                      <SelectItem value="Group B">Group B</SelectItem>
                      <SelectItem value="Group C">Group C</SelectItem>
                      <SelectItem value="Group D">Group D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Instructor-specific fields */}
            {formData.role === 'instructor' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Select value={formData.title} onValueChange={(value) => setFormData({ ...formData, title: value })}>
                    <SelectTrigger id="edit-title">
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Teaching Assistant">Teaching Assistant</SelectItem>
                      <SelectItem value="Lecturer">Lecturer</SelectItem>
                      <SelectItem value="Senior Lecturer">Senior Lecturer</SelectItem>
                      <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                      <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                      <SelectItem value="Professor">Professor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-department">Department</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                    <SelectTrigger id="edit-department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Information Technology">Information Technology</SelectItem>
                      <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} className="bg-primary hover:bg-primary/90">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              for {selectedUser?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Manage Courses Dialog (for Instructors) */}
      <Dialog open={isCoursesDialogOpen} onOpenChange={setIsCoursesDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Courses for {selectedUser?.name}</DialogTitle>
            <DialogDescription>Assign or remove courses for this instructor</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Currently assigned courses */}
            {formData.assignedCourses.length > 0 && (
              <div className="space-y-2">
                <Label>Assigned Courses</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.assignedCourses.map(courseId => (
                    <Badge key={courseId} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      {getCourseName(courseId)}
                      <button
                        onClick={() => handleCourseToggle(courseId)}
                        className="ml-1 hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Available courses to assign */}
            <div className="space-y-2">
              <Label>Available Courses</Label>
              <div className="border rounded-md max-h-60 overflow-y-auto">
                {mockCourses.map(course => {
                  const isAssigned = formData.assignedCourses.includes(course.id);
                  return (
                    <div
                      key={course.id}
                      className={`flex items-center space-x-3 p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
                        isAssigned ? 'bg-primary/5' : ''
                      }`}
                    >
                      <Checkbox
                        id={`course-${course.id}`}
                        checked={isAssigned}
                        onCheckedChange={() => handleCourseToggle(course.id)}
                      />
                      <label
                        htmlFor={`course-${course.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">{course.code}</div>
                        <div className="text-sm text-muted-foreground">{course.name}</div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCoursesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCourses} className="bg-primary hover:bg-primary/90">
              Save Courses
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
