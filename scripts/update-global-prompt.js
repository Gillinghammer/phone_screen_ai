import axios from 'axios';
import { GLOBAL_PROMPT, NODE_CONFIGS } from '../src/lib/config/bland.js';

const BLAND_API_KEY = process.env.BLAND_API_KEY;

async function updatePathwayGlobalPrompt(pathwayId) {
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

    // Update all Default nodes with the global prompt from config
    const updatedNodes = existingPathway.nodes.map(node => {
      if (node.type === 'Default') {
        // If this is a special node (start, ready, end), use its config
        if (node.data.isStart) {
          return { ...NODE_CONFIGS.start };
        }
        if (node.id === 'ready_to_begin') {
          // Extract jobTitle from the existing node's text
          const jobTitleMatch = node.data.text.match(/phone screen for the (.*?) position/);
          const jobTitle = jobTitleMatch ? jobTitleMatch[1] : 'open';
          return { ...NODE_CONFIGS.ready(jobTitle) };
        }
        // For question nodes, preserve the existing question text
        if (node.id.startsWith('question_')) {
          const index = parseInt(node.id.split('_')[1]) - 1;
          return { ...NODE_CONFIGS.question(node.data.text, index) };
        }
        // For any other Default node, just update the globalPrompt
        return {
          ...node,
          data: {
            ...node.data,
            globalPrompt: GLOBAL_PROMPT
          }
        };
      }
      if (node.type === 'End Call') {
        return { ...NODE_CONFIGS.end };
      }
      return node;
    });

    // Prepare the updated pathway
    const updatedPathway = {
      ...existingPathway,
      nodes: updatedNodes
    };

    console.log('Updating pathway with new global prompt...');

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
      console.log('Successfully updated pathway global prompt');
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
    
    if (!Array.isArray(pathways)) {
      console.error('Invalid response from pathway list endpoint:', pathways);
      return;
    }

    console.log(`Found ${pathways.length} pathways to update`);

    // Update each pathway sequentially
    for (const pathway of pathways) {
      await updatePathwayGlobalPrompt(pathway.id);
    }

    console.log('\nFinished updating all pathways');
  } catch (error) {
    console.error('Error fetching pathways:', error.response?.data || error.message);
  }
}

// Execute the update for all pathways
updateAllPathways();
