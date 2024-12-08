import axios from 'axios';
import { NODE_CONFIGS } from '../src/lib/config/bland.js';

const BLAND_API_KEY = process.env.BLAND_API_KEY;

async function updatePathwayQuestionFormat(pathwayId) {
  try {
    console.log(`\nProcessing pathway: ${pathwayId}`);
    console.log('Fetching pathway data...');
    
    const getResponse = await axios.get(
      `https://api.bland.ai/v1/pathway/${pathwayId}`,
      {
        headers: {
          'authorization': BLAND_API_KEY
        }
      }
    );

    const existingPathway = getResponse.data;
    console.log('Successfully fetched pathway data');

    if (!existingPathway || !Array.isArray(existingPathway.nodes)) {
      console.error('Invalid pathway data:', existingPathway);
      return;
    }

    // Update question nodes to use prompt instead of text
    const updatedNodes = existingPathway.nodes.map(node => {
      if (node.type === 'Default' && node.id.startsWith('question_')) {
        // Extract the original question text
        const originalQuestion = node.data.text;
        const index = parseInt(node.id.split('_')[1]) - 1;
        
        // Create new node with prompt format
        return {
          ...node,
          data: {
            ...node.data,
            prompt: `Ask the candidate the question: ${originalQuestion}`,
            text: undefined // Remove the text property
          }
        };
      }
      return node;
    });

    // Prepare the updated pathway
    const updatedPathway = {
      ...existingPathway,
      nodes: updatedNodes
    };

    console.log('Updating pathway with new question format...');

    const response = await axios.post(
      `https://api.bland.ai/v1/pathway/${pathwayId}`,
      updatedPathway,
      {
        headers: {
          'authorization': BLAND_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 200) {
      console.log('Successfully updated pathway question format');
    } else {
      console.error('Failed to update pathway:', response.data);
    }
  } catch (error) {
    console.error('Error updating pathway:', error.response?.data || error.message);
  }
}

async function updateAllPathways() {
  try {
    console.log('Fetching all pathways...');
    
    const getResponse = await axios.get(
      'https://api.bland.ai/v1/pathway',
      {
        headers: {
          'authorization': BLAND_API_KEY
        }
      }
    );

    const pathways = getResponse.data;
    console.log(`Found ${pathways.length} pathways`);

    for (const pathway of pathways) {
      await updatePathwayQuestionFormat(pathway.id);
    }

    console.log('\nFinished updating all pathways');
  } catch (error) {
    console.error('Error fetching pathways:', error.response?.data || error.message);
  }
}

// Execute the update for all pathways
updateAllPathways();
