import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, FileText, Eye, BookOpen } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { courseService } from '@/api/services/CourseServices';
import type { CourseListItem } from '@/types/ApiTypes';

interface InstructorCoursesProps {
  instructorId: string;
  onNavigate: (page: string, data?: any) => void;
}

export default function InstructorCourses({ instructorId, onNavigate }: InstructorCoursesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const data = await courseService.getInstructorCourses(instructorId);
        setCourses(data);
      } catch (error) {
        console.error('Failed to fetch instructor courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (instructorId) {
      fetchCourses();
    }
  }, [instructorId]);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.academicYearNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

    if (isLoading) {
    return (
      <div className="p-6 space-y-6 bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="text-slate-400">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white text-3xl mb-2">My Courses</h1>
        <p className="text-slate-400">Manage all your courses and quizzes</p>
      </div>

      {/* Search */}
      <Card className="bg-slate-800 border-slate-700 mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <Input
              placeholder="Search by course name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-slate-400">
          Showing {filteredCourses.length} of {courses.length} courses
        </p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card
            key={course.id}
            className="bg-slate-800 border-slate-700 hover:border-blue-600 transition-all cursor-pointer group"
            onClick={() => onNavigate('course-detail', { courseId: course.id, course })}
          >
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-white" size={24} />
                </div>
                <Badge className="bg-green-600 text-white">
                  Active
                </Badge>
              </div>

              {/* Course Info */}
              <h3 className="text-white text-lg mb-1 group-hover:text-blue-400 transition-colors">
                {course.title}
              </h3>
              <p className="text-slate-500 text-sm mb-3">Year {course.academicYearNumber}</p>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1 text-slate-400">
                  <Users size={16} />
                  <span>{course.studentCount || 0} students</span>
                </div>
              </div>

              {/* View Button */}
              <Button
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  onNavigate('course-detail', { courseId: course.id, course });
                }}
                className="w-full bg-slate-700 hover:bg-blue-600 text-white transition-colors"
              >
                <Eye size={16} className="mr-2" />
                View Course
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <Card className="bg-slate-800 border-slate-700 p-12">
          <div className="text-center">
            <BookOpen className="mx-auto text-slate-600 mb-4" size={48} />
            <h3 className="text-white text-xl mb-2">No courses found</h3>
            <p className="text-slate-400 mb-4">
              Try adjusting your search criteria
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
              }}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              Clear Search
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
