import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { courseService } from "../../api/services/CourseServices";
import { academicYearService } from "../../api/services/AcademicYearServices";
import type { CourseListItem, AcademicYear } from "../../types/ApiTypes";

export function CourseManagement() {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", academicYearId: "", description: "", code: "" });
  const [selectedCourse, setSelectedCourse] = useState<CourseListItem | null>(null);
  // Add search state
  const [courseSearchTerm, setCourseSearchTerm] = useState("");

  useEffect(() => {
    fetchCourses();
    fetchAcademicYears();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (e) {
      toast.error("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const years = await academicYearService.getAcademicYears();
      setAcademicYears(years);
    } catch (e) {
      toast.error("Failed to load academic years");
    }
  };

  const handleCreateCourse = async () => {
    setIsLoading(true);
    try {
      await courseService.createCourse({
        title: formData.title,
        academicYearId: formData.academicYearId,
        description: formData.description,
        code: formData.code,
      });
      toast.success("Course created successfully");
      setIsDialogOpen(false);
      setFormData({ title: "", academicYearId: "", description: "", code: "" });
      fetchCourses();
    } catch (e) {
      toast.error("Failed to create course");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    setIsLoading(true);
    try {
      await courseService.deleteCourse(id);
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (e) {
      toast.error("Failed to delete course");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (course: CourseListItem) => {
    setSelectedCourse(course);
    setFormData({ 
      title: course.title, 
      academicYearId: course.academicYearId,
      description: course.description || "",
      code: course.code || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCourse = async () => {
    if (!selectedCourse) return;
    setIsLoading(true);
    try {
      await courseService.updateCourse(selectedCourse.id, {
        title: formData.title,
        academicYearId: formData.academicYearId,
        description: formData.description,
        code: formData.code,
      });
      toast.success("Course updated successfully");
      setIsEditDialogOpen(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (e) {
      toast.error("Failed to update course");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter courses by search term
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(courseSearchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Course Management</CardTitle>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            + Add Course
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search input */}
        <div className="mb-4 flex gap-4">
          <div className="relative flex-1">
            <Input
              placeholder="Search courses by title..."
              value={courseSearchTerm}
              onChange={e => setCourseSearchTerm(e.target.value)}
              className="pl-4"
            />
          </div>
        </div>
        <div className="rounded-md border">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <span className="text-muted-foreground text-lg">Loading courses...</span>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <span className="text-3xl mb-2">📚</span>
              <span className="text-lg mb-2">No courses found</span>
              <span className="mb-4">Get started by adding your first course.</span>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-primary text-white">Add Course</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>
                      {academicYears.find(y => y.id === course.academicYearId)?.number || course.academicYearId}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(course)}
                          className="hover:bg-primary/10 hover:text-primary transition-all"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCourse(course.id)}
                          className="hover:bg-destructive/10 text-destructive hover:text-destructive transition-all"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>

      {/* Create Course Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Course Title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
            <Input
              placeholder="Course Code"
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
            />
            <Input
              placeholder="Course Description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
            <Select value={formData.academicYearId} onValueChange={value => setFormData({ ...formData, academicYearId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Academic Year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map(year => (
                  <SelectItem key={year.id} value={year.id}>{year.number}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCourse} disabled={isLoading}>
              {isLoading ? "Creating..." : "Add Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Course Title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
            <Select value={formData.academicYearId} onValueChange={value => setFormData({ ...formData, academicYearId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Academic Year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map(year => (
                  <SelectItem key={year.id} value={year.id}>{year.number}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateCourse} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
