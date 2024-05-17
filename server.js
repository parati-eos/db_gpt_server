const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const propertyToSchemaMap = require('./propertyToSchemaMap');

// MongoDB connection string
const mongoUri = 'mongodb+srv://pdnigade77:Prthmsh123@formresponse.2ipy7xx.mongodb.net/test?retryWrites=true&w=majority';

const app = express();
app.use(bodyParser.json());

const submissionSchema = new mongoose.Schema({}, { strict: false });
const Submission = mongoose.model('Submission', submissionSchema, 'submissions');

const gptSchema = new mongoose.Schema({}, { strict: false });
const GptResponse = mongoose.model('GptResponse', gptSchema, 'Db_Gpt');

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
  
      console.log('Fetched Submission Data:', submission.toObject());
  
      const sectionData = submission[section];
      if (!sectionData) {
        return res.status(404).send({ error: `${section} section not found in submission` });
      }
  
      const prompts = Object.keys(sectionData).map(key => {
        const entry = propertyToSchemaMap[key];
        if (entry && entry.section === section) {
          return `${entry.prompt} ${sectionData[key]}`;
        }
        return null;
      }).filter(prompt => prompt !== null);
  
      console.log('Generated Prompts:', prompts);
  
      if (prompts.length === 0) {
        return res.status(400).send({ error: 'No valid prompts found for the specified section' });
      }
  
      const gptResponse = await axios.post('https://api.openai.com/v1/engines/gpt-3.5-turbo-instruct/completions', {
        prompt: prompts.join('\n'),
        max_tokens: 150
      }, {
        headers: {
          'Authorization': `Bearer sk-proj-IXJThLJdVofX5RHQCRRXT3BlbkFJEB3ll2mclfpKpaG1DkMQ`,
          'Content-Type': 'application/json'
        }
      });
  
      const gptData = {
        ...submission.toObject(),
        gptResponse: gptResponse.data
      };
  
      const gptDoc = new GptResponse(gptData);
      await gptDoc.save();
  
      res.send(gptDoc);
    } catch (error) {
      console.error('Error while processing the request:', error.response ? error.response.data : error.message);
      res.status(500).send({ error: 'An error occurred while processing the request' });
    }
  });
  

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
