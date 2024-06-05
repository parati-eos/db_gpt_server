const { GPT, NestedGPT } = require('../gpt');
const { primaryColor } = require('../propertyToSchemaMap');
const cleanAndSplit = require('../utils/cleanandsplit');
const hexToRgb = require('../utils/hex_to_rgb');
// const aboutPrompts = require('../utils/prompts/aboutPrompts');
const separateHeaderDescription = require('../utils/sepreateHeaderDescription')
const mixColors = require('../utils/mixcolors')


async function aboutController(submission,aboutPrompts) {
    const { about, companyDetails } = submission;
    const { tagline, primaryColor: primaryColorHex, secondaryColor: secondaryColorHex, companyName, companyLogo } = about;
    const { companyOverview } = companyDetails;

    const tagLine = tagline === "" 
        ? await GPT(aboutPrompts.tagline.prompt, companyOverview) 
        : tagline;

    const primaryrgb = hexToRgb(primaryColorHex);
    const secondaryrgb = hexToRgb(secondaryColorHex);

    const primaryColorCheck = (primaryrgb[0]>230 && primaryrgb[1]>230 && primaryrgb[2]>230) ? 1:0;
    const secondaryColorCheck = (secondaryrgb[0]>230 && secondaryrgb[1]>230 && secondaryrgb[2]>230)? 1:0;

    const aboutVision = GPT(aboutPrompts.aboutVision.prompt, tagLine);
    const aboutTitle = GPT(aboutPrompts.aboutTitle.prompt, `${companyOverview} ${await aboutVision}`);
    const aboutGPT = NestedGPT(aboutPrompts.aboutGPT.prompt, aboutPrompts.aboutGPT.Refine, `${companyOverview} ${await aboutVision}`);
    const aboutpointsPromise = aboutGPT.then(cleanAndSplit);

    const aboutpoints = await aboutpointsPromise;
    
    const aboutHeaderPromises = aboutpoints.map(async (point) => {
        const { header, description } = separateHeaderDescription(point);
        if (header === "") {
            return await GPT(aboutPrompts.aboutPointtsHeader.prompt, description);
        }
        return header;
    });

    const [
        resolvedAboutVision,
        resolvedAboutTitle,
        resolvedAboutGPT,
        resolvedAboutHeader1,
        resolvedAboutHeader2,
        resolvedAboutHeader3,
        resolvedAboutHeader4,
        resolvedAboutHeader5
    ] = await Promise.all([
        aboutVision,
        aboutTitle,
        aboutGPT,
        ...aboutHeaderPromises
    ]);

    const aboutResponse = {
        companyName,
        companyLogo,
        primaryColorR: primaryrgb[0],
        primaryColorG: primaryrgb[1],
        primaryColorB: primaryrgb[2],
        primaryColorCheck: primaryColorCheck,
        secondaryColorR: secondaryrgb[0],
        secondaryColorG: secondaryrgb[1],
        secondaryColorB: secondaryrgb[2],
        secondaryColorCheck: secondaryColorCheck,
        colorP100: primaryColorHex,
        colorP75_S25: mixColors(primaryColorHex,secondaryColorHex,75,25),
        colorP50_S50: mixColors(primaryColorHex,secondaryColorHex,50,50),
        colorP25_S75: mixColors(primaryColorHex,secondaryColorHex,25,75),
        colorS100: secondaryColorHex,
        colorF_S100: "test",
        colorF_P100: "test",
        SCL: "test",
        SCD: "test",
        tagLine,
        coverImage: 'freepik',
        aboutTitle: resolvedAboutTitle,
        aboutVision: resolvedAboutVision,
        aboutGPT: resolvedAboutGPT,
        aboutGPTCleaned: "test",
        aboutGPT1: "test",
        aboutGPT2: "test",
        aboutGPT3: "test",
        aboutGPT4: "test",
        aboutGPT5: "test",
        aboutHeader1: resolvedAboutHeader1,
        aboutHeader2: resolvedAboutHeader2,
        aboutHeader3: resolvedAboutHeader3,
        aboutHeader4: resolvedAboutHeader4,
        aboutHeader5: resolvedAboutHeader5,
        about1: aboutpoints[0],
        about2: aboutpoints[1],
        about3: aboutpoints[2],
        about4: aboutpoints[3],
        about5: aboutpoints[4],
        aboutImageURL: "freepik",
    };

    return aboutResponse;
}

module.exports = aboutController;
