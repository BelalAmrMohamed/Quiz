// Script/filterUtils.js - Course Filtering & Metadata Extraction

/**
 * Extract unique values for faculties, years, and terms from categoryTree
 */
export function extractMetadata(categoryTree) {
    const faculties = new Set();
    const years = new Set();
    const terms = new Set();
  
    Object.values(categoryTree).forEach(category => {
      // Only look at top-level categories (courses) with metadata
      if (!category.parent) {
        if (category.faculty) faculties.add(category.faculty);
        if (category.year) years.add(category.year);
        if (category.term) terms.add(category.term);
      }
    });
  
    return {
      faculties: Array.from(faculties).sort(),
      years: Array.from(years).sort((a, b) => {
        // Sort years numerically
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.localeCompare(b);
      }),
      terms: Array.from(terms).sort((a, b) => {
        // Sort terms numerically
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.localeCompare(b);
      })
    };
  }
  
  /**
   * Filter courses based on faculty, year, and term
   * Supports "All" option for each filter
   */
  export function filterCourses(categoryTree, filters) {
    const { faculty, year, term } = filters;
  
    return Object.entries(categoryTree)
      .filter(([key, category]) => {
        // Only filter top-level categories (courses)
        if (category.parent) return false;
  
        // If category doesn't have metadata, exclude it from filtered results
        if (!category.faculty || !category.year || !category.term) return false;
  
        // Apply filters (null or "All" means no filter)
        if (faculty && faculty !== 'All' && category.faculty !== faculty) {
          return false;
        }
  
        if (year && year !== 'All' && category.year !== year) {
          return false;
        }
  
        if (term && term !== 'All' && category.term !== term) {
          return false;
        }
  
        return true;
      })
      .map(([key, category]) => ({ key, ...category }));
  }
  
  /**
   * Get courses that match user's subscriptions
   */
  export function getSubscribedCourses(categoryTree, subscribedCourseIds) {
    return Object.entries(categoryTree)
      .filter(([key, category]) => {
        // Only consider top-level categories (courses)
        if (category.parent) return false;
        
        // Check if this course is in the subscription list
        return category.id && subscribedCourseIds.includes(category.id);
      })
      .map(([key, category]) => ({ key, ...category }));
  }
  
  /**
   * Get all root courses (with or without metadata)
   */
  export function getAllRootCourses(categoryTree) {
    return Object.entries(categoryTree)
      .filter(([key, category]) => !category.parent)
      .map(([key, category]) => ({ key, ...category }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  
  /**
   * Check if a course matches the given filters
   */
  export function courseMatchesFilters(course, filters) {
    const { faculty, year, term } = filters;
  
    if (!course.faculty || !course.year || !course.term) {
      return false;
    }
  
    if (faculty && faculty !== 'All' && course.faculty !== faculty) {
      return false;
    }
  
    if (year && year !== 'All' && course.year !== year) {
      return false;
    }
  
    if (term && term !== 'All' && course.term !== term) {
      return false;
    }
  
    return true;
  }
  
  /**
   * Get count of items in a course (subcategories + exams)
   */
  export function getCourseItemCount(course) {
    const subcatCount = course.subcategories ? course.subcategories.length : 0;
    const examCount = course.exams ? course.exams.length : 0;
    return subcatCount + examCount;
  }