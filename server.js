const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const aboutController = require('./controllers/aboutController');
const problemController = require('./controllers/problemController');
const solutionController = require('./controllers/solutionController');
const productScreenShotController = require('./controllers/productScreenShotController')
const productController = require('./controllers/productController');
const businessModelController = require('./controllers/businessModelController');
const gtmController = require('./controllers/gtmController');
const competitorsController = require('./controllers/competitorsController')
const marketController = require('./controllers/marketController')
const Response = require('./models/ResponseModel');

// MongoDB connection string
const mongoUri = 'mongodb+srv://pdnigade77:Prthmsh123@formresponse.2ipy7xx.mongodb.net/test?retryWrites=true&w=majority';

const app = express();
app.use(bodyParser.json());

const submissionSchema = new mongoose.Schema({}, { strict: false });
const Submission = mongoose.model('Submission', submissionSchema, 'submissions');

// Mongoose connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Connect to MongoDB
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log('Failed to connect to MongoDB', err);
  });

app.post('/fetch-and-process', async (req, res) => {
  const { filter, section } = req.body;

  if (!filter || !section) {
    return res.status(400).send({ error: 'filter and section are required' });
  }

  try {
    const submission = await Submission.findOne(filter);

    if (!submission) {
      return res.status(404).send({ error: 'Submission not found' });
    }

    const sectionData = submission[section];
    if (!sectionData || sectionData.length === 0) {
      return res.status(400).send({ error: 'No valid data found for the specified section' });
    }

    const db = mongoose.connection.db;
    const collection = db.collection('Prompts');
    const prompts = await collection.findOne({});


    if (!prompts) {
      return res.status(404).send({ error: 'Prompts not found' });
    }
  
    const { aboutPrompts, problemPrompts, solutionPrompts, productPrompts, productScreenShotPrompts, businessModel,gtmPrompts,competitorsPrompts, marketPrompts} = prompts;

    try {
      const [
        about,
        problemDescription,
        solutionDescription,
        product,
        productScreen,
        businessModelResult,
        gtm,
        competitors
      ] = await Promise.all([
        aboutController(submission, aboutPrompts),
        problemController(submission, problemPrompts),
        solutionController(submission, solutionPrompts),
        productController(submission, productPrompts),
        productScreenShotController(submission, productScreenShotPrompts),
        businessModelController(submission, businessModel),
        gtmController(submission,gtmPrompts),
        competitorsController(submission,competitorsPrompts)
      ]);
    
     const marketControllerResult = await marketController(submission,marketPrompts);
      
      const gptResponse = new Response({
        about,
        problemDescription,
        solutionDescription,
        product,
        productScreen,
        businessModel: businessModelResult,
        goToMarket: gtm,
        competitors: competitors,
        market:marketControllerResult
      });
      await gptResponse.save();
      res.send(gptResponse);
    } catch (error) {
      console.error('Error creating GPT response:', error);
    }
    

    
    
  } catch (error) {
    console.error('Error while processing the request:', error.message);
    res.status(500).send({ error: 'An error occurred while processing the request' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
