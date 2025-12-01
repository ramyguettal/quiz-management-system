import { useState } from 'react';
import { Search, Filter, Users, FileText, Eye, Plus, BookOpen } from 'lucide-react';
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

interface InstructorCoursesProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function InstructorCourses({ onNavigate }: InstructorCoursesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const courses = [
    {
      id: 1,
      name: 'Advanced Database Systems',
      code: 'CS501',
      semester: 'Fall 2024',
      enrolledStudents: 42,
      quizzes: 6,
      status: 'Active',
      description: 'Advanced concepts in database design, query optimization, and distributed databases.'
    },
    {
      id: 2,
      name: 'Web Development Fundamentals',
      code: 'CS201',
      semester: 'Fall 2024',
      enrolledStudents: 58,
      quizzes: 8,
      status: 'Active',
      description: 'Introduction to modern web development using HTML, CSS, JavaScript, and React.'
    },
    {
      id: 3,
      name: 'Data Structures & Algorithms',
      code: 'CS301',
      semester: 'Fall 2024',
      enrolledStudents: 51,
      quizzes: 7,
      status: 'Active',
      description: 'Core data structures and algorithmic techniques for problem solving.'
    },
    {
      id: 4,
      name: 'Software Engineering',
      code: 'CS401',
      semester: 'Fall 2024',
      enrolledStudents: 35,
      quizzes: 5,
      status: 'Active',
      description: 'Software development lifecycle, design patterns, and project management.'
    },
    {
      id: 5,
      name: 'Computer Networks',
      code: 'CS451',
      semester: 'Spring 2024',
      enrolledStudents: 38,
      quizzes: 4,
      status: 'Archived',
      description: 'Network protocols, architecture, and security fundamentals.'
    },
    {
      id: 6,
      name: 'Machine Learning',
      code: 'CS502',
      semester: 'Spring 2024',
      enrolledStudents: 29,
      quizzes: 6,
      status: 'Archived',
      description: 'Introduction to supervised and unsupervised learning algorithms.'
    }
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSemester = filterSemester === 'all' || course.semester === filterSemester;
    const matchesStatus = filterStatus === 'all' || course.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesSemester && matchesStatus;
  });

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white text-3xl mb-2">My Courses</h1>
        <p className="text-slate-400">Manage all your courses and quizzes</p>
      </div>

      {/* Search and Filters */}
      <Card className="bg-slate-800 border-slate-700 mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <Input
                placeholder="Search by course name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

            {/* Semester Filter */}
            <Select value={filterSemester} onValueChange={setFilterSemester}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white focus:border-blue-500">
                <Filter size={16} className="mr-2 text-slate-500" />
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">All Semesters</SelectItem>
                <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                <SelectItem value="Spring 2024">Spring 2024</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white focus:border-blue-500">
                <Filter size={16} className="mr-2 text-slate-500" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-slate-400">
          Showing {filteredCourses.length} of {courses.length} courses
        </p>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus size={18} className="mr-2" />
          Add New Course
        </Button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card
            key={course.id}
            className="bg-slate-800 border-slate-700 hover:border-blue-600 transition-all cursor-pointer group"
            onClick={() => onNavigate('course-detail', { courseId: course.id })}
          >
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-white" size={24} />
                </div>
                <Badge
                  className={
                    course.status === 'Active'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-600 text-slate-300'
                  }
                >
                  {course.status}
                </Badge>
              </div>

              {/* Course Info */}
              <h3 className="text-white text-lg mb-1 group-hover:text-blue-400 transition-colors">
                {course.name}
              </h3>
              <p className="text-slate-500 text-sm mb-3">{course.code}</p>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{course.description}</p>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1 text-slate-400">
                  <Users size={16} />
                  <span>{course.enrolledStudents} students</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <FileText size={16} />
                  <span>{course.quizzes} quizzes</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 mb-4">{course.semester}</div>

              {/* View Button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('course-detail', { courseId: course.id });
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
              Try adjusting your search or filter criteria
            </p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setFilterSemester('all');
                setFilterStatus('all');
              }}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
