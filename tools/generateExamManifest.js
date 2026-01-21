/* The next line runs this file which generates Script/examManifest.js
node tools/generateExamManifest.js
*/

const fs = require("fs").promises;
const path = require("path");

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const res = path.resolve(dir, entry.name);
      return entry.isDirectory() ? walk(res) : res;
    }),
  );
  return Array.prototype.concat(...files);
}

function titleCase(name) {
  return name.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

async function buildCategoryTree(examsDir) {
  const tree = {};
  const usedIds = new Set();

  function generateUniqueId() {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const idLength = 8;
    let id;

    // Generate random IDs until we find one that hasn't been used
    do {
      id = "";
      for (let i = 0; i < idLength; i++) {
        id += charset.charAt(Math.floor(Math.random() * charset.length));
      }
    } while (usedIds.has(id));

    usedIds.add(id);
    return id;
  }

  /**
   * Recursively scan directories with metadata extraction
   * 
   * Folder Structure:
   * Exams/
   *   {Faculty}/           <- Level 0: Metadata only
   *     {Year}/            <- Level 1: Metadata only
   *       {Term}/          <- Level 2: Metadata only
   *         {Course}/      <- Level 3: Root category (gets metadata)
   *           {Subfolder}/ <- Level 4+: Subcategories
   *             quiz.js
   * 
   * @param {string} dir - Current directory path
   * @param {number} depth - Current recursion depth (0 = Faculty level)
   * @param {object} metadata - Accumulated metadata from parent levels
   */
  async function scanDir(dir, depth = 0, metadata = {}) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (depth === 0) {
          // Level 1: Faculty (metadata only, don't create category)
          console.log(`  📁 Faculty: ${entry.name}`);
          await scanDir(fullPath, 1, { faculty: entry.name });
          
        } else if (depth === 1) {
          // Level 2: Year (metadata only, don't create category)
          console.log(`    📅 Year: ${entry.name}`);
          await scanDir(fullPath, 2, { ...metadata, year: entry.name });
          
        } else if (depth === 2) {
          // Level 3: Term (metadata only, don't create category)
          console.log(`      📆 Term: ${entry.name}`);
          await scanDir(fullPath, 3, { ...metadata, term: entry.name });
          
        } else if (depth === 3) {
          // Level 4: Course Name (ROOT CATEGORY with metadata)
          const categoryKey = entry.name;
          const courseId = generateUniqueId();
          
          console.log(`        📚 Course: ${entry.name} (ID: ${courseId})`);
          
          tree[categoryKey] = {
            id: courseId,
            name: entry.name,
            faculty: metadata.faculty,
            year: metadata.year,
            term: metadata.term,
            path: [entry.name],
            parent: null,
            subcategories: [],
            exams: []
          };
          
          // Recurse into course folder with tracking metadata
          await scanDir(fullPath, 4, {
            ...metadata,
            courseName: entry.name,
            currentPath: [entry.name],
            currentKey: categoryKey
          });
          
        } else {
          // Level 5+: Subcategories within a course
          const newPath = [...metadata.currentPath, entry.name];
          const categoryKey = newPath.join('/');
          
          console.log(`          📂 Subcategory: ${categoryKey}`);
          
          tree[categoryKey] = {
            name: entry.name,
            path: newPath,
            parent: metadata.currentKey,
            subcategories: [],
            exams: []
          };
          
          // Add to parent's subcategories list
          if (tree[metadata.currentKey]) {
            if (!tree[metadata.currentKey].subcategories.includes(categoryKey)) {
              tree[metadata.currentKey].subcategories.push(categoryKey);
            }
          }
          
          // Recurse deeper with updated tracking
          await scanDir(fullPath, depth + 1, {
            ...metadata,
            currentPath: newPath,
            currentKey: categoryKey
          });
        }
        
      } else if (entry.name.endsWith('.js')) {
        // Handle exam files (only if we're inside a course)
        if (depth >= 3 && metadata.currentKey) {
          const fileName = entry.name;
          const baseId = fileName.replace(/\.js$/, '');
          
          // Generate unique ID for this exam
          const examId = generateUniqueId();
          const title = titleCase(baseId);
          
          // Calculate relative path from Script/ directory
          const scriptDir = path.join(path.dirname(examsDir), 'Script');
          let relPath = path.relative(scriptDir, fullPath)
            .split(path.sep)
            .join('/');
          if (!relPath.startsWith('.')) relPath = './' + relPath;
          
          const exam = {
            id: examId,
            title,
            path: relPath,
            category: metadata.currentKey
          };
          
          console.log(`            📝 Exam: ${title} (ID: ${examId})`);
          
          // Add exam to the current category
          if (tree[metadata.currentKey]) {
            tree[metadata.currentKey].exams.push(exam);
          } else {
            console.warn(`WARNING: Category "${metadata.currentKey}" not found for exam "${title}"`);
          }
        } else if (depth < 3) {
          console.warn(`WARNING: Exam file "${entry.name}" found at depth ${depth} (outside course structure), skipping`);
        }
      }
    }
  }

  console.log("\n🔍 Scanning exam directory structure...\n");
  await scanDir(examsDir);
  console.log("\n✅ Scan complete!\n");
  
  return tree;
}

async function generate() {
  const repoRoot = path.resolve(__dirname, "..");
  const examsDir = path.join(repoRoot, "Exams");
  const scriptDir = path.join(repoRoot, "Script");

  console.log("📦 Starting exam manifest generation...");
  console.log(`📂 Exams directory: ${examsDir}`);
  console.log(`📂 Output directory: ${scriptDir}\n`);

  const categoryTree = await buildCategoryTree(examsDir);

  // Flatten exams for backward compatibility
  const allExams = [];
  Object.values(categoryTree).forEach((cat) => {
    cat.exams.forEach((exam) => allExams.push(exam));
  });

  allExams.sort((a, b) => (a.category + a.id).localeCompare(b.category + b.id));

  // Verify no duplicate IDs
  const idCounts = {};
  allExams.forEach((exam) => {
    idCounts[exam.id] = (idCounts[exam.id] || 0) + 1;
  });
  
  const duplicates = Object.entries(idCounts).filter(([_, count]) => count > 1);
  if (duplicates.length > 0) {
    console.error("❌ ERROR: Duplicate exam IDs found:");
    duplicates.forEach(([id, count]) => {
      console.error(`  - "${id}" appears ${count} times`);
    });
    process.exit(1);
  }

  // Verify no duplicate category IDs
  const categoryIdCounts = {};
  Object.values(categoryTree).forEach((cat) => {
    if (cat.id) {
      categoryIdCounts[cat.id] = (categoryIdCounts[cat.id] || 0) + 1;
    }
  });
  
  const categoryDuplicates = Object.entries(categoryIdCounts).filter(([_, count]) => count > 1);
  if (categoryDuplicates.length > 0) {
    console.error("❌ ERROR: Duplicate category IDs found:");
    categoryDuplicates.forEach(([id, count]) => {
      console.error(`  - "${id}" appears ${count} times`);
    });
    process.exit(1);
  }

  // Write output file
  const outFile = path.join(scriptDir, "examManifest.js");
  const header = `// Auto-generated by tools/generateExamManifest.js - do not edit by hand\n// Run: node tools/generateExamManifest.js\n// Generated at: ${formatDateTime()}\n\n`;
  const body =
    "export const examList = " +
    JSON.stringify(allExams, null, 2) +
    ";\n\n" +
    "export const categoryTree = " +
    JSON.stringify(categoryTree, null, 2) +
    ";\n";

  await fs.writeFile(outFile, header + body, "utf8");
  
  console.log("✅ Success!");
  console.log(`📄 Wrote: ${outFile}`);
  console.log(`📊 Generated ${allExams.length} exams across ${Object.keys(categoryTree).length} categories\n`);
  
  // Summary statistics
  const rootCategories = Object.values(categoryTree).filter(cat => !cat.parent);
  const subcategories = Object.values(categoryTree).filter(cat => cat.parent);
  
  console.log("📈 Summary:");
  console.log(`   • Root Categories (Courses): ${rootCategories.length}`);
  console.log(`   • Subcategories: ${subcategories.length}`);
  console.log(`   • Total Exams: ${allExams.length}`);
  
  // Metadata breakdown
  const faculties = new Set();
  const years = new Set();
  const terms = new Set();
  
  rootCategories.forEach(cat => {
    if (cat.faculty) faculties.add(cat.faculty);
    if (cat.year) years.add(cat.year);
    if (cat.term) terms.add(cat.term);
  });
  
  console.log(`\n🏫 Metadata Coverage:`);
  console.log(`   • Faculties: ${Array.from(faculties).sort().join(', ')}`);
  console.log(`   • Years: ${Array.from(years).sort().join(', ')}`);
  console.log(`   • Terms: ${Array.from(terms).sort().join(', ')}`);
  console.log("Generated at: " + formatDateTime());
}

generate().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});

function formatDateTime() {
  const now = new Date();

  // Date components
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // Months are 0-indexed
  const day = now.getDate();

  // Time components
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Combine into the requested format
  return `${year}/${month}/${day}   |   ${hours}:${minutes} ${ampm}`;
}