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
   * Get available years for a specific faculty (cascading filter)
   * @param {Object} categoryTree - The category tree
   * @param {string} faculty - Selected faculty ('All' or specific faculty)
   * @returns {Array} Array of available years
   */
  export function getAvailableYears(categoryTree, faculty) {
    const years = new Set();
  
    Object.values(categoryTree).forEach(category => {
      if (!category.parent && category.year) {
        // If "All" is selected, include all years
        if (faculty === 'All') {
          years.add(category.year);
        } 
        // Otherwise, only include years for the selected faculty
        else if (category.faculty === faculty) {
          years.add(category.year);
        }
      }
    });
  
    return Array.from(years).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }
  
  /**
   * Get available terms for a specific faculty and year (cascading filter)
   * @param {Object} categoryTree - The category tree
   * @param {string} faculty - Selected faculty ('All' or specific faculty)
   * @param {string} year - Selected year ('All' or specific year)
   * @returns {Array} Array of available terms
   */
  export function getAvailableTerms(categoryTree, faculty, year) {
    const terms = new Set();
  
    Object.values(categoryTree).forEach(category => {
      if (!category.parent && category.term) {
        // If both faculty and year are "All", include all terms
        if (faculty === 'All' && year === 'All') {
          terms.add(category.term);
        }
        // If only faculty is "All", filter by year
        else if (faculty === 'All' && category.year === year) {
          terms.add(category.term);
        }
        // If only year is "All", filter by faculty
        else if (year === 'All' && category.faculty === faculty) {
          terms.add(category.term);
        }
        // If both are specified, filter by both
        else if (category.faculty === faculty && category.year === year) {
          terms.add(category.term);
        }
      }
    });
  
    return Array.from(terms).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
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