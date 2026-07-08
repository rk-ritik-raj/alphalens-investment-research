const { companyProfileTool } = require("../tools/companyProfileTool");
const { researchAgent } = require("../agents/ResearchAgent");

async function generateResearch(company) {
  const profile = await companyProfileTool(company);

  if (!profile.success) {
    throw new Error(profile.message);
  }

  const analysis = await researchAgent(profile.data);

  return {
    profile: profile.data,
    analysis,
  };
}

module.exports = {
  generateResearch,
};
