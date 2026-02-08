// Dummy content data structure - simulates API responses
export const dummyContentData = {
  announcements: [
    { id: 'ann1', title: 'Welcome to the Course', contents: [
      { id: 'c1', type: 'announcement', content: 'Welcome! This course is designed to help you master the fundamentals. Please read the course syllabus and complete the introductory materials.' }
    ]},
    { id: 'ann2', title: 'Assignment 1 Extended', contents: [
      { id: 'c2', type: 'announcement', content: 'Due to popular request, Assignment 1 deadline has been extended to next Friday. Please plan accordingly.' }
    ]},
  ],
  materials: [
    { id: 'mat1', title: 'Course Introduction', contents: [
      { id: 'c3', type: 'notes', title: 'Course Introduction', content: 'These are the fundamental concepts you need to know:\n\n1. Foundation: Understand the basics\n2. Structure: Learn how concepts relate\n3. Application: Practice with real examples' }
    ]},
    { id: 'mat2', title: 'Python Basics', contents: [
      { id: 'c4', type: 'video', title: 'Python Basics Video', videoId: 'dQw4w9WgXcQ', description: 'Introduction to Python programming' }
    ]},
    { id: 'mat3', title: 'Reference Guide', contents: [
      { id: 'c5', type: 'pdf', title: 'Reference Guide PDF', pdfUrl: 'https://example.com/guide.pdf', description: 'Complete reference guide for the course' }
    ]},
  ],
  assignments: [
    { id: 'asgn1', title: 'Assignment 1 - Basics', contents: [
      { id: 'c6', type: 'notes', title: 'Assignment Instructions', content: 'Create a simple Python program that:\n1. Takes user input\n2. Processes it\n3. Displays output\n\nSubmit your .py file', grading: { totalPoints: 100, rubric: 'Functionality 50%, Code Quality 30%, Documentation 20%' } }
    ]},
    { id: 'asgn2', title: 'Assignment 2 - Functions', contents: [
      { id: 'c7', type: 'video', title: 'Assignment Overview', videoId: 'jNQXAC9IVRw', description: 'Watch this to understand the requirements', grading: { totalPoints: 100, rubric: 'Video submission quality 100%' } }
    ]},
  ],
  assessments: [
    { id: 'assess1', title: 'Quiz 1 - Concepts', contents: [
      { id: 'c8', type: 'notes', title: 'Quiz Instructions', content: 'Quiz covers:\n- Basic definitions\n- Key concepts\n- Application scenarios', grading: { totalPoints: 50, rubric: 'Knowledge 100%' } }
    ]},
    { id: 'assess2', title: 'Midterm Exam Resources', contents: [
      { id: 'c9', type: 'pdf', title: 'Midterm Study Guide', pdfUrl: 'https://example.com/midterm-prep.pdf', description: 'Study guide for midterm exam', grading: { totalPoints: 200, rubric: 'Exam 100%' } }
    ]},
  ],
}

export const dummyUserProgress = {
  announcements: { read: ['ann1'] },
  materials: { viewed: ['mat1', 'mat2'] },
  assignments: { submitted: [{ id: 'asgn1', score: 85, feedback: 'Good work!' }], inProgress: ['asgn2'] },
  assessments: { completed: [{ id: 'assess1', score: 45 }], pending: ['assess2'] },
}
