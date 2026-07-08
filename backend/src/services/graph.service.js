const { buildInvestmentGraph } = require("../graph/investmentGraph");

const graph = buildInvestmentGraph();

async function runInvestmentWorkflow(initialState) {
  return await graph.invoke(initialState);
}

module.exports = {
  runInvestmentWorkflow,
};
