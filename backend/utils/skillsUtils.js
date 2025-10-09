/**
 * Helper functions for skills management
 */

/**
 * Process skills from resume extraction and format them for storage
 * @param {Object} extractedData - Data extracted from resume
 * @returns {Array} Formatted skills array
 */
function processExtractedSkills(extractedData) {
  if (!extractedData || !extractedData.skills_by_category) {
    return [];
  }

  const { skills_by_category } = extractedData;
  const formattedSkills = [];

  // Process programming languages
  if (skills_by_category.programming_languages) {
    skills_by_category.programming_languages.forEach(skill => {
      formattedSkills.push({
        name: skill,
        level: 'Intermediate',
        verified: false,
        category: 'Programming Languages'
      });
    });
  }

  // Process web technologies
  if (skills_by_category.web_technologies) {
    skills_by_category.web_technologies.forEach(skill => {
      formattedSkills.push({
        name: skill,
        level: 'Intermediate',
        verified: false,
        category: 'Web Technologies'
      });
    });
  }

  // Process DevOps tools
  if (skills_by_category.devops_tools) {
    skills_by_category.devops_tools.forEach(skill => {
      formattedSkills.push({
        name: skill,
        level: 'Intermediate',
        verified: false,
        category: 'DevOps Tools'
      });
    });
  }

  // Process web frameworks
  if (skills_by_category.web_frameworks) {
    skills_by_category.web_frameworks.forEach(skill => {
      formattedSkills.push({
        name: skill,
        level: 'Intermediate',
        verified: false,
        category: 'Web Frameworks'
      });
    });
  }

  // Process databases
  if (skills_by_category.databases) {
    skills_by_category.databases.forEach(skill => {
      formattedSkills.push({
        name: skill,
        level: 'Intermediate',
        verified: false,
        category: 'Databases'
      });
    });
  }

  // Process soft skills
  if (skills_by_category.soft_skills) {
    skills_by_category.soft_skills.forEach(skill => {
      formattedSkills.push({
        name: skill,
        level: 'Intermediate',
        verified: true,
        category: 'Soft Skills'
      });
    });
  }

  // Add any other category that might be in the extracted data
  Object.keys(skills_by_category).forEach(category => {
    if (
      !['programming_languages', 'web_technologies', 'devops_tools', 
       'web_frameworks', 'databases', 'soft_skills'].includes(category) &&
      Array.isArray(skills_by_category[category])
    ) {
      skills_by_category[category].forEach(skill => {
        formattedSkills.push({
          name: skill,
          level: 'Intermediate',
          verified: false,
          category: category.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
        });
      });
    }
  });

  return formattedSkills;
}

module.exports = {
  processExtractedSkills
};