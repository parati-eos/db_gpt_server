const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const propertyToSchemaMap = require('./propertyToSchemaMap');

const app = express();
const port = 3000;

app.use(express.json());

const dbURI = 'mongodb+srv://pdnigade77:Prthmsh123@formresponse.2ipy7xx.mongodb.net/test?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Mongoose connected to MongoDB'))
  .catch((err) => console.log('Mongoose connection error:', err));

const submissionSchema = new mongoose.Schema({
  user: {
    userId: String,
    submissionId: String,
    _id: mongoose.Schema.Types.ObjectId
  },
  about: {
    companyName: String,
    tagline: String,
    logo: String,
    primaryColor: String,
    secondaryColor: String,
    _id: mongoose.Schema.Types.ObjectId
  },
  // Define other sections similarly
  companyDetails: {
    establishmentYear: String,
    companyOverview: String,
    _id: mongoose.Schema.Types.ObjectId
  },
  problemDescription: {
    problemDescription: String,
    _id: mongoose.Schema.Types.ObjectId
  },
  solutionDescription: {
    solutionsDescription: String,
    _id: mongoose.Schema.Types.ObjectId
  },
  market: {
    sector: String,
    otherSector: String,
    marketDescription: String,
    TAM: String,
    TAMGrowthRate: String,
    SAM: String,
    SAMGrowthRate: String,
    _id: mongoose.Schema.Types.ObjectId
  },
  product: {
    productOverview: String,
    productRoadmap: String,
    productRoadmapDescription: String,
    technicalArchitecture: String,
    _id: mongoose.Schema.Types.ObjectId
  },
  productScreen: {
    appType: String,
    mobileScreenshots: Array,
    webScreenshots: Array,
    _id: mongoose.Schema.Types.ObjectId
  },
  businessModel: {
    businessModel: String,
    _id: mongoose.Schema.Types.ObjectId
  },
  goToMarket: {
    keyStakeholders: String,
    customerPersona: String,
    goToMarketStrategy: String,
    _id: mongoose.Schema.Types.ObjectId
  },
  trackRecord: {
    trackRecord: Array,
    _id: mongoose.Schema.Types.ObjectId
  },
  caseStudies: {
    caseStudies: String,
    _id: mongoose.Schema.Types.ObjectId
  },
  testimonials: {
    testimonials: Array,
    _id: mongoose.Schema.Types.ObjectId
  },
  competitors: {
    competitors: Array,
    _id: mongoose.Schema.Types.ObjectId
  },
  competitiveDiff: {
    competitiveDiff: String,
    _id: mongoose.Schema.Types.ObjectId
  },
  teamMembers: {
    teamMembers: Array,
    _id: mongoose.Schema.Types.ObjectId
  },
  contactInfo: {
    websiteLink: String,
    linkedinLink: String,
    contactEmail: String,
    contactPhone: String,
    _id: mongoose.Schema.Types.ObjectId
  },
  financialInfo: {
    financialSnapshot: String,
    revenueCost: Array,
    plannedRaise: String,
    useOfFunds: Array,
    percentage: String,
    _id: mongoose.Schema.Types.ObjectId
  },
  gptResponse: mongoose.Schema.Types.Mixed
});

const Submission = mongoose.model('Submission', submissionSchema);

app.post('/fetch-and-process', async (req, res) => {
  try {
    const { filter, section } = req.body;

    const submission = await Submission.findOne(filter);
    if (!submission) {
      return res.status(404).send('Submission not found');
    }

    const sectionData = submission[section];
    const prompts = Object.keys(sectionData).map(field => {
      if (propertyToSchemaMap[field]) {
        return {
          field,
          prompt: propertyToSchemaMap[field].prompt + ' ' + sectionData[field]
        };
      }
      return null;
    }).filter(prompt => prompt !== null);

    console.log('Generated Prompts:', prompts);

    const responses = await Promise.all(prompts.map(async ({ field, prompt }) => {
      const gptResponse = await axios.post('https://api.openai.com/v1/completions', {
        model: 'gpt-3.5-turbo-instruct',
        prompt: prompt,
        max_tokens: 150
      }, {
        headers: {
          'Authorization': `sk-proj-F8TPZUUS5Sm60ynkY8QTT3BlbkFJXb1ezr4FsnxKEQAtyYWu`,
          'Content-Type': 'application/json'
        }
      });
      
      const generatedText = gptResponse.data.choices[0].text.trim();
      return { field, response: generatedText };
    }));

    responses.forEach(({ field, response }) => {
      submission[section][field] = response;
    });

    const savedSubmission = await submission.save();
    res.send(savedSubmission);
  } catch (error) {
    console.error('Error while processing the request:', error.response ? error.response.data : error.message);
    res.status(500).send({ error: 'An error occurred while processing the request' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
