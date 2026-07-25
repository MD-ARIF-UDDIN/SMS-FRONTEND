/**
 * Bangladesh Madrasa & National Education Board GPA & Grade Calculator
 * Handles Mandatory vs. Optional (4th Subject) logic
 */

/**
 * Calculates subject grade and grade point from obtained marks (out of 100).
 */
export function calculateSubjectGrade(marksObtained, isAbsent = false) {
  if (isAbsent) {
    return { grade: 'F', point: 0.0, label: 'অনুপস্থিত' };
  }

  const marks = Number(marksObtained || 0);

  if (marks >= 80) return { grade: 'A+', point: 5.0, label: 'A+ (GPA 5.00)' };
  if (marks >= 70) return { grade: 'A',  point: 4.0, label: 'A (GPA 4.00)' };
  if (marks >= 60) return { grade: 'A-', point: 3.5, label: 'A- (GPA 3.50)' };
  if (marks >= 50) return { grade: 'B',  point: 3.0, label: 'B (GPA 3.00)' };
  if (marks >= 40) return { grade: 'C',  point: 2.0, label: 'C (GPA 2.00)' };
  if (marks >= 33) return { grade: 'D',  point: 1.0, label: 'D (GPA 1.00)' };
  return { grade: 'F', point: 0.0, label: 'F (অকৃতকার্য)' };
}

/**
 * Calculates overall GPA and Pass/Fail status for a student across all subjects in an exam.
 * 
 * Rules:
 * 1. Mandatory Subjects: Failing in ANY mandatory subject -> Overall Result = Failed ('F') & GPA = 0.00.
 * 2. Optional (4th) Subject: Failing in optional subject DOES NOT fail the student overall.
 *    Points above 2.00 (GP - 2.0) are added as bonus points to the mandatory total!
 * 3. Overall GPA = (Sum(Mandatory Points) + Bonus(Optional Points)) / Count(Mandatory Subjects) [max 5.00].
 */
export function calculateStudentOverallGPA(subjectMarksMap, classSubjects = []) {
  if (!classSubjects || classSubjects.length === 0) {
    return { gpa: '0.00', letterGrade: 'N/A', isPassed: false, totalMarks: 0, failedCount: 0 };
  }

  let totalMarks = 0;
  let mandatoryPoints = 0;
  let optionalBonusPoints = 0;
  let hasFailedMandatory = false;
  let failedCount = 0;

  const mandatorySubjects = classSubjects.filter(s => !s.is_optional && s.subject_category !== 'Optional');
  const optionalSubjects = classSubjects.filter(s => s.is_optional || s.subject_category === 'Optional');

  // 1. Evaluate Mandatory Subjects
  mandatorySubjects.forEach((sub) => {
    const markEntry = subjectMarksMap[sub.id];

    if (!markEntry) {
      hasFailedMandatory = true;
      failedCount++;
      return;
    }

    const isAbsent = Boolean(markEntry.is_absent);
    const marks = Number(markEntry.marks_obtained || 0);

    totalMarks += marks;

    const { grade, point } = calculateSubjectGrade(marks, isAbsent);

    if (grade === 'F' || marks < 33) {
      hasFailedMandatory = true;
      failedCount++;
    } else {
      mandatoryPoints += point;
    }
  });

  // 2. Evaluate Optional Subjects (Bonus points if GP > 2.00)
  optionalSubjects.forEach((sub) => {
    const markEntry = subjectMarksMap[sub.id];
    if (!markEntry) return;

    const isAbsent = Boolean(markEntry.is_absent);
    const marks = Number(markEntry.marks_obtained || 0);

    totalMarks += marks;

    const { grade, point } = calculateSubjectGrade(marks, isAbsent);

    if (grade !== 'F' && point > 2.0) {
      optionalBonusPoints += (point - 2.0); // e.g. A+ (5.0) -> 3.0 bonus points
    }
  });

  const mandatoryCount = mandatorySubjects.length > 0 ? mandatorySubjects.length : classSubjects.length;

  if (hasFailedMandatory || failedCount > 0) {
    return {
      gpa: '0.00',
      letterGrade: 'F',
      isPassed: false,
      totalMarks,
      failedCount,
      totalSubjects: classSubjects.length
    };
  }

  const rawGpa = (mandatoryPoints + optionalBonusPoints) / mandatoryCount;
  const finalGpa = Math.min(5.0, rawGpa).toFixed(2);

  let letterGrade = 'D';
  const gpaNum = parseFloat(finalGpa);
  if (gpaNum >= 5.0) letterGrade = 'A+';
  else if (gpaNum >= 4.0) letterGrade = 'A';
  else if (gpaNum >= 3.5) letterGrade = 'A-';
  else if (gpaNum >= 3.0) letterGrade = 'B';
  else if (gpaNum >= 2.0) letterGrade = 'C';

  return {
    gpa: finalGpa,
    letterGrade,
    isPassed: true,
    totalMarks,
    failedCount: 0,
    totalSubjects: classSubjects.length
  };
}
