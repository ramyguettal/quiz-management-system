import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, BookOpen, X, Loader2 } from "lucide-react";
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
import { userService } from "../../api/services/UserServices";
import { courseService } from "../../api/services/CourseServices";
import type { UserResponse, CourseListItem } from "../../types/ApiTypes";
import { toast } from "sonner";

interface UserManagementProps {
  currentUserRole?: 'admin' | 'superadmin';
}

interface User {
  id: string;
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
  phoneNumber?: string;
  officeLocation?: string;
  bio?: string;
  assignedCourses?: string[];
}

export function UserManagement({ currentUserRole = 'admin' }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'instructor'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCoursesDialogOpen, setIsCoursesDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    phoneNumber: '',
    officeLocation: '',
    bio: '',
    assignedCourses: [] as string[]
  });

  // Fetch users from API
  const fetchUsers = async (role?: 'student' | 'instructor') => {
    setIsLoadingUsers(true);
    try {
      const [usersData, coursesData] = await Promise.all([
        userService.getUsers(role ? { role } : undefined),
        courseService.getAllCourses()
      ]);

      // Transform API response to User format
      const transformedUsers: User[] = usersData.map((user: UserResponse) => ({
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role.toLowerCase() as 'student' | 'instructor',
        status: user.status.toLowerCase() === 'active' ? 'active' as const : 'inactive' as const,
        assignedCourses: []
      }));

      setUsers(transformedUsers);
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Fetch users on component mount and when filter changes
  useEffect(() => {
    fetchUsers(roleFilter === 'all' ? undefined : roleFilter);
  }, [roleFilter]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = async () => {
    setIsLoading(true);
    
    try {
      if (formData.role === 'instructor') {
        await userService.createInstructor({
          email: formData.email,
          fullName: formData.name,
          title: formData.title,
          phoneNumber: formData.phoneNumber,
          department: formData.department,
          officeLocation: formData.officeLocation,
          bio: formData.bio,
        });
        toast.success('Instructor created successfully!');
      } else if (formData.role === 'student') {
        await userService.createStudent({
          email: formData.email,
          fullName: formData.name,
          academicYear: formData.year,
          groupNumber: formData.group,
        });
        toast.success('Student created successfully!');
      } else if (formData.role === 'admin') {
        await userService.createAdmin({
          email: formData.email,
          fullName: formData.name,
        });
        toast.success('Admin created successfully!');
      }
      
      // Add to local state for UI update (use timestamp as temp id until refresh)
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: 'active',
        ...(formData.role === 'student' && { year: formData.year, group: formData.group }),
        ...(formData.role === 'instructor' && { 
          title: formData.title, 
          department: formData.department,
          phoneNumber: formData.phoneNumber,
          officeLocation: formData.officeLocation,
          bio: formData.bio,
          assignedCourses: [] 
        })
      };
      setUsers([...users, newUser]);
      setIsAddDialogOpen(false);
      resetFormData();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create user. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
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

  const handleDeleteUser = async () => {
    if (selectedUser) {
      setIsLoading(true);
      try {
        await userService.deactivateUser(selectedUser.id);
        // Update local state to show user as inactive
        setUsers(users.map(user =>
          user.id === selectedUser.id
            ? { ...user, status: 'inactive' as const }
            : user
        ));
        toast.success('User deactivated successfully!');
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
      } catch (error: any) {
        const errorMessage = error?.message || 'Failed to deactivate user. Please try again.';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetFormData = () => {
    setFormData({ name: '', email: '', role: 'student', year: '', group: '', title: '', department: '', phoneNumber: '', officeLocation: '', bio: '', assignedCourses: [] });
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
      phoneNumber: user.phoneNumber || '',
      officeLocation: user.officeLocation || '',
      bio: user.bio || '',
      assignedCourses: user.assignedCourses || []
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const openCoursesDialog = async (user: User) => {
    setSelectedUser(user);
    setIsCoursesDialogOpen(true);
    setIsLoading(true);
    
    try {
      // Fetch courses already assigned to this instructor
      const instructorCourses = await courseService.getInstructorCourses(user.id);
      const assignedCourseIds = instructorCourses.map(course => course.id);
      
      setFormData({
        ...formData,
        assignedCourses: assignedCourseIds
      });
    } catch (error) {
      console.error('Failed to fetch instructor courses:', error);
      // If fetch fails, start with empty assigned courses
      setFormData({
        ...formData,
        assignedCourses: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseToggle = (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedCourses: prev.assignedCourses.includes(courseId)
        ? prev.assignedCourses.filter(id => id !== courseId)
        : [...prev.assignedCourses, courseId]
    }));
  };

  const handleSaveCourses = async () => {
    if (selectedUser) {
      setIsLoading(true);
      try {
        await courseService.assignCoursesToInstructor(selectedUser.id, {
          courseIds: formData.assignedCourses
        });
        
        setUsers(users.map(user =>
          user.id === selectedUser.id
            ? { ...user, assignedCourses: formData.assignedCourses }
            : user
        ));
        toast.success('Courses assigned successfully!');
        setIsCoursesDialogOpen(false);
        setSelectedUser(null);
      } catch (error: any) {
        const errorMessage = error?.message || 'Failed to assign courses. Please try again.';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
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
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.title} (Year ${course.academicYearNumber})` : courseId;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex-1">
            <CardTitle className="text-xl sm:text-2xl mb-2">User Management</CardTitle>
            <p className="text-sm text-muted-foreground">Manage user accounts and permissions</p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)} 
            className="bg-primary hover:bg-primary/90  sm:w-auto sm:shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={(value: 'all' | 'student' | 'instructor') => setRoleFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="instructor">Instructors</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block rounded-md border">
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
              {isLoadingUsers ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
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
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="bg-card/50 border hover:border-primary/50 transition-colors">
              <CardContent className="p-5">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">{user.name}</h4>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(user)}
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(user)}
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getRoleBadge(user.role)}
                    <Badge variant={user.status === 'active' ? 'outline' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
                  {currentUserRole === 'superadmin' && (
                    <SelectItem value="admin">Admin</SelectItem>
                  )}
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
                      <SelectItem value="Y1">1st Year</SelectItem>
                      <SelectItem value="Y2">2nd Year</SelectItem>
                      <SelectItem value="Y3">3rd Year</SelectItem>
                      <SelectItem value="Y4">4th Year</SelectItem>
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
                      <SelectItem value="G1">Group 1</SelectItem>
                      <SelectItem value="G2">Group 2</SelectItem>
                      <SelectItem value="G3">Group 3</SelectItem>
                      <SelectItem value="G4">Group 4</SelectItem>
                      <SelectItem value="G5">Group 5</SelectItem>
                      <SelectItem value="G6">Group 6</SelectItem>
                      <SelectItem value="G7">Group 7</SelectItem>
                      <SelectItem value="G8">Group 8</SelectItem>
                      <SelectItem value="G9">Group 9</SelectItem>
                      <SelectItem value="G10">Group 10</SelectItem>
                      <SelectItem value="G11">Group 11</SelectItem>
                      <SelectItem value="G12">Group 12</SelectItem>
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
                <div className="space-y-2">
                  <Label htmlFor="add-phone">Phone Number</Label>
                  <Input
                    id="add-phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-office">Office Location</Label>
                  <Input
                    id="add-office"
                    placeholder="Enter office location"
                    value={formData.officeLocation}
                    onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-bio">Bio</Label>
                  <Input
                    id="add-bio"
                    placeholder="Enter bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser} className="bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Add User'}
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
                  {currentUserRole === 'superadmin' && (
                    <SelectItem value="admin">Admin</SelectItem>
                  )}
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

      {/* Deactivate User Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate User?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the user account for {selectedUser?.name}. 
              The user will no longer be able to access the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90" disabled={isLoading}>
              {isLoading ? 'Deactivating...' : 'Deactivate'}
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
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading courses...</span>
            </div>
          ) : (
            <>
              {/* Currently assigned courses */}
              {formData.assignedCourses.length > 0 && (
                <div className="space-y-2">
                  <Label>Assigned Courses ({formData.assignedCourses.length})</Label>
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
            <Label>Available Courses ({courses.length})</Label>
            <div 
              className="border rounded-md overflow-auto"
              style={{ maxHeight: '300px' }}
            >
              {courses.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No courses available
                </div>
              ) : (
                <>
                  {courses.map((course, index) => {
                    const isAssigned = formData.assignedCourses.includes(course.id);
                    return (
                      <div
                        key={course.id}
                        className={`flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                          isAssigned ? 'bg-primary/10' : ''
                        } ${index !== courses.length - 1 ? 'border-b' : ''}`}
                        onClick={() => handleCourseToggle(course.id)}
                      >
                        <Checkbox
                          id={`course-${course.id}`}
                          checked={isAssigned}
                          onCheckedChange={() => handleCourseToggle(course.id)}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{course.title}</div>
                          <div className="text-sm text-muted-foreground">Year {course.academicYearNumber}</div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
            </>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCoursesDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSaveCourses} className="bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Courses'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
