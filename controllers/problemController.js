const { GPT, NestedGPT } = require('../gpt');
const cleanAndSplit = require('../utils/cleanandsplit');
// const problemPrompts = require('../utils/prompts/problemPrompts')
const separateHeaderDescription = require('../utils/sepreateHeaderDescription')

async function problemController(submission,problemPrompts){
    const{ companyDetails,problemDescription} = submission;
    const { companyOverview } = companyDetails;

    const problemTitle = await GPT(problemPrompts.problemTitle.prompt,companyOverview);
    const problemStatement = await GPT(problemPrompts.problemStatement.prompt,companyOverview)
    const problemGPT = await NestedGPT(problemPrompts.problemGPT.prompt,problemPrompts.problemGPT.Refine,companyOverview)
    const problemPoints = cleanAndSplit(problemGPT);

    const problemHeaderPromises = problemPoints.map(async (point) => {
        const { header, description } = separateHeaderDescription(point);
        if (header === "") {
            return await GPT(problemPrompts.problemPointHeader.prompt, description);
        }
        return header;
    });

    const [
        problemHeader1,
        problemHeader2,
        problemHeader3,
        problemHeader4,
        problemHeader5,
        problemHeader6
    ] = await Promise.all([
        ...problemHeaderPromises
    ]);
    
    
    const problemResponse = {
    problemTitle: problemTitle,
    problemStatement: problemStatement,
    problemGPT: problemGPT,
    problemGPTCleaned: "test",
    problemGPT1: "test",
    problemGPT2: "test",
    problemGPT3: "test",
    problemGPT4: "test",
    problemGPT5: "test",
    problemGPT6: "test",
    problemHeader1: problemHeader1,
    problemHeader2: problemHeader2,
    problemHeader3: problemHeader3,
    problemHeader4: problemHeader4,
    problemHeader5: problemHeader5,
    problemHeader6: problemHeader6,
    problemDescription1: problemPoints[0],
    problemDescription2: problemPoints[1],
    problemDescription3: problemPoints[2],
    problemDescription4: problemPoints[3],
    problemDescription5: problemPoints[4],
    problemDescription6: problemPoints[5],
    problemIcon1: "test",
    problemIcon2: "test",
    problemIcon3: "test",
    problemIcon4: "test",
    problemIcon5: "test",
    problemIcon6: "test"

    }
    return problemResponse;

}

module.exports = problemController