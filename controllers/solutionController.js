const { GPT, NestedGPT } = require('../gpt');
const cleanAndSplit = require('../utils/cleanandsplit');
const separateHeaderDescription = require('../utils/sepreateHeaderDescription')

async function solutionController(submission,solutionPrompts){
    const{ companyDetails,solutionDescription} = submission;
    const { companyOverview } = companyDetails;

    const solutionTitle = await GPT(solutionPrompts.solutionTitle.prompt,companyOverview);
    const solutionStatement = await GPT(solutionPrompts.solutionStatement.prompt,companyOverview)
    const solutionGPT = await NestedGPT(solutionPrompts.solutionGPT.prompt,solutionPrompts.solutionGPT.Refine,companyOverview)
    
    const solutionPoints = cleanAndSplit(solutionGPT);

    const solutionHeaderPromises = solutionPoints.map(async (point) => {
        const { header, description } = separateHeaderDescription(point);
        if (header === "") {
            return await GPT(solutionPrompts.solutionPointHeader.prompt, description);
        }
        return header;
    });

    const [
        solutionHeader1,
        solutionHeader2,
        solutionHeader3,
        solutionHeader4,
        solutionHeader5,
        solutionHeader6
    ] = await Promise.all([
        ...solutionHeaderPromises
    ]);

    const solutionResponse = {
        iterativeSolution: "test",
        solutionTitle: solutionTitle,
        solutionStatement: solutionStatement,
        solutionGPT: solutionGPT,
        solutionGPTCleaned: "test",
        solutionGPT1: "test",
        solutionGPT2: "test",
        solutionGPT3: "test",
        solutionGPT4: "test",
        solutionGPT5: "test",
        solutionGPT6: "test",
        solutionHeader1: solutionHeader1,
        solutionHeader2: solutionHeader2,
        solutionHeader3: solutionHeader3,
        solutionHeader4: solutionHeader4,
        solutionHeader5: solutionHeader5,
        solutionHeader6: solutionHeader6,
        solutionDescription1: solutionPoints[0],
        solutionDescription2: solutionPoints[1],
        solutionDescription3: solutionPoints[2],
        solutionDescription4: solutionPoints[3],
        solutionDescription5: solutionPoints[4],
        solutionDescription6: solutionPoints[5],
        solutionIcon1: "test",
        solutionIcon2: "test",
        solutionIcon3: "test",
        solutionIcon4: "test",
        solutionIcon5: "test",
        solutionIcon6: "test"
    }
    return solutionResponse;

}

module.exports = solutionController