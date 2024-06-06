const { GPT, NestedGPT } = require('../gpt');
const cleanAndSplit = require('../utils/cleanandsplit');
const separateHeaderDescription = require('../utils/sepreateHeaderDescription')



async function productController(submission,productPrompts){
    const {product,companyDetails} = submission;
    const {productOverview} = product;
    const { companyOverview } = companyDetails;
    const productTitle  = await GPT(productPrompts.productTitle.prompt,productOverview);
    const productOverviewResponse  = await GPT(productPrompts.productOverview.prompt,productOverview);
    const featureGPT = await NestedGPT(productPrompts.featureGPT.prompt,productPrompts.featureGPT.Refine,productOverview)
    const productRoadmapTitle  = await GPT(productPrompts.productRoadmapTitle.prompt,productOverview);
    const roadMapPhaseGPT = await NestedGPT(productPrompts.phaseGPT.prompt,productPrompts.phaseGPT.Refine,`${productOverview} ${companyOverview}`)
    const featurePoints = cleanAndSplit(featureGPT);

    const roadMapPhasePoints = cleanAndSplit(roadMapPhaseGPT);

    const featureHeaderPromises = featurePoints.map(async (point) => {
        const { header, description } = separateHeaderDescription(point);
        if (header === "") {
            return await GPT(productPrompts.featurePointHeader.prompt, description);
        }
        return header;
    });

    const [
        featureHeader1,
        featureHeader2,
        featureHeader3,
        featureHeader4,
        featureHeader5,
        featureHeader6
    ] = await Promise.all([
        ...featureHeaderPromises
    ]);

    const roadMapPhaseHeaderPromises = roadMapPhasePoints.map(async (point) => {
        const { header, description } = separateHeaderDescription(point);
        if (header === "") {
            return await GPT(productPrompts.roadMapPhasePointHeader.prompt, description);
        }
        return header;
    });

    const [
        roadMapPhaseHeader1,
        roadMapPhaseHeader2,
        roadMapPhaseHeader3,
    ] = await Promise.all([
        ...roadMapPhaseHeaderPromises
    ]);


    const [
        roadMapPhaseFeature1,
        roadMapPhaseFeature2,
        roadMapPhaseFeature3,
    ] = await Promise.all([
        GPT(productPrompts.phaseFeature.prompt,roadMapPhasePoints[0]),
        GPT(productPrompts.phaseFeature.prompt,roadMapPhasePoints[1]),
        GPT(productPrompts.phaseFeature.prompt,roadMapPhasePoints[2]),
    ]);

    const productResponse = {
        productTitle: productTitle,
        productOverview: productOverviewResponse,
        featureGPT: featureGPT,
        featureGPTCleaned: "test",
        featureGPT1: "test",
        featureGPT2: "test",
        featureGPT3: "test",
        featureGPT4: "test",
        featureGPT5: "test",
        featureGPT6: "test",
        feature1: featureHeader1,
        feature2: featureHeader2,
        feature3: featureHeader3,
        feature4: featureHeader4,
        feature5: featureHeader5,
        feature6: featureHeader6,
        featureDescription1: featurePoints[0],
        featureDescription2: featurePoints[1],
        featureDescription3: featurePoints[2],
        featureDescription4: featurePoints[3],
        featureDescription5: featurePoints[4],
        featureDescription6: featurePoints[5],
        featureIcon1: "test",
        featureIcon2: "test",
        featureIcon3: "test",
        featureIcon4: "test",
        featureIcon5: "test",
        featureIcon6: "test",
        productRoadmapTitle: productRoadmapTitle,
        phaseGPT: roadMapPhaseGPT,
        phaseGPTCleaned: "test",
        phaseGPT1: "test",
        phaseGPT2: "test",
        phaseGPT3: "test",
        phaseHeader1Name: roadMapPhaseHeader1,
        phaseHeader2Name: roadMapPhaseHeader2,
        phaseHeader3Name: roadMapPhaseHeader3,
        phaseDescription1: roadMapPhasePoints[0],
        phaseDescription2: roadMapPhasePoints[1],
        phaseDescription3: roadMapPhasePoints[2],
        phaseFeatures1: roadMapPhaseFeature1,
        phaseFeatures2: roadMapPhaseFeature2,
        phaseFeatures3: roadMapPhaseFeature3,
        inputs: "test",
        technologyPlatform: "test",
        valueBasedOutput: "test"
    }
    return productResponse
}

module.exports = productController