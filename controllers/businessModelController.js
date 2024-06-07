const { GPT, NestedGPT } = require('../gpt');
const cleanAndSplit = require('../utils/cleanandsplit');
const separateHeaderDescription = require('../utils/sepreateHeaderDescription')

async function businessModelController(submission,businessModelPrompts){

    const {product,companyDetails,businessModel} = submission
    const {productOverview} = product;
    const { companyOverview } = companyDetails;
    console.log(businessModelPrompts)
    const revenueModel = await GPT(businessModelPrompts.revenueModel.prompt,productOverview)
    
    const revenueStreamGPT = await NestedGPT(businessModelPrompts.revenueStreamGPT.prompt,businessModelPrompts.revenueStreamGPT.Refine,`${productOverview} ${businessModel.businessModel}`)
    const revenueStreamPoints = cleanAndSplit(revenueStreamGPT);
    
    const revenueStreamHeaderPromises = revenueStreamPoints.map(async (point) => {
        const { header, description } = separateHeaderDescription(point);
        if (header === "") {
            return await GPT(businessModelPrompts.revenueStreamPointHeader.prompt, description);
        }
        return header;
    });

    const [
        revenueStreamHeader1,
        revenueStreamHeader2,
        revenueStreamHeader3,
        revenueStreamHeader4,
        revenueStreamHeader5,
        revenueStreamHeader6
    ] = await Promise.all([
        ...revenueStreamHeaderPromises
    ]);



    const businessModelResponse= {
        revenueModel: revenueModel,
        revenueModelImage: "test",
        revenueStreamGPT: revenueStreamGPT,
        revenueStreamGPTCleaned: "test",
        revenueStreamGPT1: "test",
        revenueStreamGPT2: "test",
        revenueStreamGPT3: "test",
        revenueStreamGPT4: "test",
        stream1: revenueStreamHeader1,
        stream2: revenueStreamHeader2,
        stream3: revenueStreamHeader3,
        stream4: revenueStreamHeader4,
        streamDescription1: revenueStreamPoints[0],
        streamDescription2: revenueStreamPoints[1],
        streamDescription3: revenueStreamPoints[2],
        streamDescription4: revenueStreamPoints[3],
        streamIcon1: "test",
        streamIcon2: "test",
        streamIcon3: "test",
        streamIcon4: "test"
    }

    return businessModelResponse;
}

module.exports = businessModelController